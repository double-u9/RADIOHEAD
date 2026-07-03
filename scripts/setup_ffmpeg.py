import os
import urllib.request
import zipfile
import shutil
import sys

def download_ffmpeg():
    # We will use the BtbN ffmpeg-master-latest-win64-gpl build which is widely used
    url = "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip"
    zip_path = "ffmpeg.zip"
    extract_dir = "ffmpeg_temp"
    final_dir = "ffmpeg_bin"

    if os.path.exists(final_dir) and os.path.exists(os.path.join(final_dir, "ffmpeg.exe")):
        print(f"FFmpeg already exists in {final_dir}")
        return

    print(f"Downloading FFmpeg from {url}...")
    urllib.request.urlretrieve(url, zip_path)

    print("Extracting...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)

    print("Moving binaries...")
    if not os.path.exists(final_dir):
        os.makedirs(final_dir)

    # Find the bin folder inside the extracted directory
    extracted_folder = os.listdir(extract_dir)[0]
    bin_folder = os.path.join(extract_dir, extracted_folder, "bin")
    
    for file in os.listdir(bin_folder):
        shutil.move(os.path.join(bin_folder, file), os.path.join(final_dir, file))

    print("Cleaning up...")
    os.remove(zip_path)
    shutil.rmtree(extract_dir)

    print(f"FFmpeg setup complete in {final_dir}!")

if __name__ == "__main__":
    download_ffmpeg()
