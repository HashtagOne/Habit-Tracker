# Habit Tracker

A daily habit tracking app built with vanilla JavaScript. Habits are organized into color-coded categories, with daily check-offs, streak tracking, and progress bars. Data persists across sessions via localStorage.

## Live Demo

Go here to view the webpage: https://hashtagone.github.io/Habit-Tracker/

## Features

- Add and delete color-coded habit categories with automatic color cycling
- Add and delete habits within each category
- Daily check-off system — check and uncheck habits per day
- Streak counter per habit — counts consecutive days completed
- Progress bar per category based on today's completions
- Confirmation modal before deletion
- Dark mode toggle with persistent preference
- Smooth animations — category pop-in on create, pop-out on delete, staggered fade-in on page load, and modal entrance/exit sequences
- Persistent state via localStorage — your habits survive page refreshes

## Tech Stack

- HTML
- CSS (custom properties, keyframe animations, CSS variables for theming)
- Vanilla JavaScript (localStorage, dynamic DOM rendering, date logic)

## What I Learned

- Managing nested application state as a single JS object and syncing it to localStorage
- Building a dynamic render system that rebuilds the DOM from state on every update
- Why storing dates instead of booleans unlocks streak tracking and historical data
- How animation conflicts arise when multiple animations share the same element, and how to resolve them with specificity, `!important`, and `isFirstRender` flags
- The tradeoff between full re-renders and direct DOM updates for smooth animations, and why frameworks like Vue solve this automatically
- How CSS variables enable instant theme switching across an entire UI from a single attribute change
