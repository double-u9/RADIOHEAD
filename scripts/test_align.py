import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
ffmpeg_dir = os.path.join(current_dir, "ffmpeg_bin")
if os.path.exists(ffmpeg_dir):
    os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]

import stable_whisper

def test_align():
    model = stable_whisper.load_faster_whisper('base', device='cpu', compute_type='int8')
    audio_path = os.path.join(current_dir, "B-side", "4 Minute Warning.mp3")
    text_path = os.path.join(current_dir, "lyrics", "01 - 4 Minute Warning.txt")
    
    with open(text_path, 'r', encoding='utf-8') as f:
        text = f.read().strip()
        
    result = model.align(audio_path, text, language='en')
    all_words = result.all_words()
    
    lines = text.split('\n')
    lrc_lines = []
    word_idx = 0
    
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
        lrc_lines.append(f"{ts} {stripped_line}")
        print(f"{ts} {stripped_line}")

test_align()
