import os
import sys
import json
import re

# Add local ffmpeg to PATH
current_dir = os.path.dirname(os.path.abspath(__file__))
ffmpeg_dir = os.path.join(current_dir, "ffmpeg_bin")
if os.path.exists(ffmpeg_dir):
    os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]

import stable_whisper

def normalize(s):
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', '', s)
    s = re.sub(r'\s+', '', s)
    return s.strip()

def extract_lyrics_title(filename):
    f = re.sub(r'\.(txt|lrc)$', '', filename, flags=re.IGNORECASE)
    f = re.sub(r'^\d+\s*-\s*', '', f)
    return f.strip()

def extract_mp3_title(filename):
    f = re.sub(r'\.mp3$', '', filename, flags=re.IGNORECASE)
    f = re.sub(r'^Radiohead\s*-\s*', '', f, flags=re.IGNORECASE)
    return f.strip()

def get_lyrics_map(lyrics_dir):
    lyrics_map = {}
    if not os.path.exists(lyrics_dir):
        return lyrics_map
        
    for f in os.listdir(lyrics_dir):
        if f.endswith('.txt'):
            try:
                with open(os.path.join(lyrics_dir, f), 'r', encoding='utf-8') as file:
                    content = file.read().strip()
                title = extract_lyrics_title(f)
                key = normalize(title)
                lrc_filename = f.replace('.txt', '.lrc')
                lyrics_map[key] = {
                    'raw': content,
                    'title': title,
                    'lrc_path': os.path.join(lyrics_dir, lrc_filename)
                }
            except Exception as e:
                print(f"Error reading {f}: {e}")
    return lyrics_map

def find_lyrics(mp3_filename, lyrics_map):
    mp3_clean_title = extract_mp3_title(mp3_filename)
    candidates = [normalize(mp3_clean_title)]
    
    for cand in candidates:
        if cand in lyrics_map:
            return lyrics_map[cand]
            
    for key, value in lyrics_map.items():
        if cand in key or key in cand:
            return value
            
    return None

def write_lrc_strict(result, raw_text, output_path):
    all_words = result.all_words()
    lines = raw_text.split('\n')
    
    word_idx = 0
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for line in lines:
            stripped_line = line.strip()
            if not stripped_line:
                continue
                
            line_char_count = len(stripped_line.replace(" ", "").replace("\t", ""))
            
            if word_idx < len(all_words):
                start_time = all_words[word_idx].start
            else:
                start_time = 0
                
            chars_consumed = 0
            while chars_consumed < line_char_count and word_idx < len(all_words):
                chars_consumed += len(all_words[word_idx].word.replace(" ", "").replace("\t", ""))
                word_idx += 1
                
            m, s = divmod(start_time, 60)
            ts = f"[{int(m):02d}:{s:05.2f}]"
            f.write(f"{ts} {stripped_line}\n")

def main():
    bsides_dir = os.path.join(current_dir, "B-side")
    lyrics_dir = os.path.join(current_dir, "lyrics")
    
    if not os.path.exists(bsides_dir):
        print("B-side directory not found!")
        return
        
    lyrics_map = get_lyrics_map(lyrics_dir)
    print(f"Found {len(lyrics_map)} txt lyrics files.")
    
    mp3_files = [f for f in os.listdir(bsides_dir) if f.endswith('.mp3')]
    print(f"Found {len(mp3_files)} MP3 files.")
    
    print("Loading faster-whisper model...")
    model = stable_whisper.load_faster_whisper('base', device='cpu', compute_type='int8')
    print("Model loaded.")
    
    processed = 0
    skipped = 0
    
    for mp3_file in mp3_files:
        print(f"\nProcessing: {mp3_file}")
        
        lyrics_info = find_lyrics(mp3_file, lyrics_map)
        
        if not lyrics_info:
            print("  -> No matching text lyrics found. Skipping.")
            skipped += 1
            continue
            
        raw_text = lyrics_info['raw']
        if raw_text.lower().startswith("no lyrics song"):
            print("  -> Instrumental track. Skipping.")
            skipped += 1
            continue
            
        lrc_path = lyrics_info['lrc_path']
        if os.path.exists(lrc_path):
            print(f"  -> LRC already exists ({lrc_path}). Skipping.")
            skipped += 1
            continue
            
        audio_path = os.path.join(bsides_dir, mp3_file)
        
        print(f"  -> Aligning audio against {len(raw_text.splitlines())} lines of text...")
        
        try:
            result = model.align(audio_path, raw_text, language='en')
            write_lrc_strict(result, raw_text, lrc_path)
            print(f"  -> Successfully generated {lrc_path}")
            processed += 1
        except Exception as e:
            print(f"  -> Error aligning {mp3_file}: {e}")
            
    print(f"\nDone! Processed {processed} tracks, Skipped {skipped}.")

if __name__ == "__main__":
    main()
