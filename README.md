# 🎵 Music Player

A modern full-stack music player built with **HTML, CSS, JavaScript, Node.js, Express, and MySQL**.

Featuring a sleek glassmorphism-inspired interface, animated playback effects, dynamic artwork backgrounds, local audio streaming, favorites management, and a responsive listening experience.

## ✨ Features

* Modern glassmorphism UI
* Dynamic artwork-based color themes
* Animated vinyl record playback
* Waveform visualizer
* Mini player controls
* Song search and filtering
* Favorites system
* Recently added tracks
* Queue management
* Shuffle and repeat modes
* MySQL-powered music library
* Local audio and cover image serving

## 🛠️ Tech Stack

* Frontend: HTML, CSS, Vanilla JavaScript
* Backend: Node.js + Express
* Database: MySQL
* Media Storage: Local File System

## 📁 Project Structure

```text
music-player/
├── main.html
├── server.js
├── styles.css
├── script.js
├── songs/
├── covers/
├── .env
└── README.md
```

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Amirbmn/Music-Player.git
cd music-player
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure MySQL

Create a MySQL database and update your environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=music_player
PORT=3000
```

### 4. Start the server

```bash
node server.js
```

Open:

```text
http://localhost:3000
```

## ⚠️ Note for Cloners (Media Setup)

To keep this repository lightweight, audio files and cover artwork are **not included**.

To run the project locally:

1. Create a `songs/` folder and a `covers/` folder in the project root.
2. Add your own `.mp3` files to `/songs`.
3. Add cover images to `/covers`.
4. Insert matching records into your MySQL database using:

   * Correct audio file paths
   * Correct cover image paths
   * Your preferred artwork colors (`color1`, `color2`, `color3`)

Without these assets and database records, the interface will load but no tracks will be available.


