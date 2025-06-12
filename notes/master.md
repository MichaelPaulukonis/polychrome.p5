# Polychrome - Master Documentation

## Overview
PolychromeText is a multi-color text painter

## Technology Stack
- **p5.js**: Core creative coding library for all visual rendering
- **Nuxt 2**: Framework for building the application
- **JavaScript/ES6+**: Primary programming language
- **HTML5/CSS3**: Application structure and styling
- **Local Storage**: For saving user preferences and creations
- **Responsive Design**: Adapts to various screen sizes and devices

## Core Features
- Interactive canvas with real-time visual feedback
- User controls for adjusting parameters
- Save and export functionality for created artworks
- "auto-paint" by random-selection of parameters

## Architecture
- **Modular Component System**: Separation of concerns with independent modules
- **Event-Driven Model**: Utilizing p5.js event system for user interactions
- **Object-Oriented Design**: Encapsulating visual elements as objects
- **File Structure**:
  - `/assets`: Images, fonts, and other static assets
  - `/components`: component
  - `/dev.utilites`: which are somehow different from tools (not part of deployed app)
  - `/layouts`: layouts
  - `/lib`: Third-party libraries
  - `/pages`: pages
  - `/plugins`
  - `/src`: Source code
  - `/static`: fonts and favicon
  - `/styles`: CSS styling
  - `/tools`: move images around for animating (not part of deployed app)
  - `/utils`: Utility functions and helpers


## Development Guidelines
- **Code Style**: Follow JavaScript Standard Style guidelines
- **Documentation**: Document all functions and complex code sections
- **Naming Conventions**: Use camelCase for variables and functions
- **Testing**: Test visual components manually on different devices/browsers

## Setup Instructions
1. **Prerequisites**:
   - Node.js (latest LTS version)
   - npm or yarn package manager

2. **Installation**:
   ```zsh
   git clone https://github.com/username/polychrome.p5.git
   cd polychrome.p5
   npm install
   ```

3. **Running Locally**:
   ```zsh
   npm start
   ```
   The application will be available at `http://localhost:3000`

4. **Building for Production**:
   ```zsh
   npm run build
   ```

## Roadmap
1. migrate to TypeScript for better type safety
1. migrate from Nuxt 2 to Nuxt 3
1. a real parser for the DSL / a real DSL
1. tests
1. UI work
1. fix color components in UI
1. more color algorithms
1. draw to selected portion of canvas
1. lok at q5
1. cheerio can be removed, see dragline for native example
