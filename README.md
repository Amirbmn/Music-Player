# 🎵 Music Player

A modern full-stack music player built with **HTML, CSS, JavaScript, Node.js, Express, and MySQL**.

The project features a polished glassmorphism-inspired interface, animated playback visuals, dynamic artwork backgrounds, favorites management, song search, queue handling, and local audio streaming.

## ✨ Features

* Beautiful animated music player UI
* Dynamic gradient backgrounds based on track colors
* Vinyl record playback animation
* Real-time waveform visualizer
* Mini player with playback controls
* Search songs instantly
* Favorites system
* Recently added songs section
* Queue management
* Shuffle and repeat modes
* MySQL database integration
* Local audio and cover image serving through Express

## 🛠️ Tech Stack

* Frontend: HTML, CSS, Vanilla JavaScript
* Backend: Node.js, Express
* Database: MySQL
* Media Storage: Local file system

## 📁 Project Structure

```text
/
├── main.html
├── server.js
├── songs/
├── covers/
└── database
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MySQL

Create a MySQL database and update the connection settings inside `server.js`.

### 3. Start the Server

```bash
node server.js
```

The application will be available at:

```text
http://localhost:3000
```

## ⚠️ Note for Cloners (Media Setup)

To keep this repository lightweight, physical audio files and high-resolution cover artwork are **not included**.

To run the project locally:

1. Create a `songs/` folder and a `covers/` folder in the project root.
2. Add your own `.mp3` files to `/songs`.
3. Add cover images to `/covers`.
4. Insert matching records into your MySQL database using:

   * Correct audio file paths
   * Correct cover image paths
   * Your preferred artwork color palette (`color1`, `color2`, `color3`)

Without these assets and database records, the player interface will load but no tracks will be available.

## 📜 License

This project is available for learning, personal use, and further customization.
