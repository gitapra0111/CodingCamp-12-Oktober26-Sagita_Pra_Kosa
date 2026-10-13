# Personal Dashboard – Project Steering

## Project Overview
A personal dashboard web app built with vanilla HTML, CSS, and JavaScript.
No frameworks. No backend. Data stored in browser LocalStorage.

## Tech Stack
- HTML5
- CSS3 (with CSS Custom Properties for theming)
- Vanilla JavaScript (ES6+)
- Browser LocalStorage API

## Folder Structure
```
revou/
├── index.html       # Main entry point
├── css/
│   └── style.css    # Single CSS file – all styling including light/dark theme
└── js/
    └── script.js    # Single JS file – all application logic
```

## Features Implemented
- **Greeting** – Live clock, date display, time-based greeting, custom user name
- **Focus Timer** – Pomodoro-style countdown with custom duration (1–60 min)
- **To-Do List** – Add, edit, complete, delete tasks with LocalStorage persistence
- **Quick Links** – Bookmark-style link cards with defaults and LocalStorage persistence
- **Light/Dark Mode** – Theme toggle with LocalStorage persistence
- **Prevent Duplicate Tasks** – Case-insensitive duplicate check with inline warning

## LocalStorage Keys
| Key                  | Purpose                        |
|----------------------|--------------------------------|
| `dashboardTheme`     | Saved light/dark preference    |
| `dashboardUserName`  | User's custom greeting name    |
| `dashboardTasks`     | Array of to-do task objects    |
| `dashboardLinks`     | Array of quick link objects    |
| `pomodoroMinutes`    | Custom pomodoro duration       |

## Coding Conventions
- CSS variables defined in `:root` for all theme colors
- Dark mode applied via `html.dark` class
- JS organized in 8 sections with clear comments
- All event listeners grouped at the bottom of script.js
