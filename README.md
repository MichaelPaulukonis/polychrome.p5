# PolychromeText

## Poly-WHAT???
Polychrome - or many colors.

**A creative coding tool for painting with colorful text.**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/MichaelPaulukonis/polychrome.p5)
![Version](https://img.shields.io/badge/version-1.4.1-blue)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Traditionally, text and image are segregated in Western Art.

PolychromeText is a web-app that plays with those boundaries, providing a many-colored text painting environment. Different from other text painting environments.

![screenshot of polychrometext showing the fill menu](./docs/images/polychrome_screenshot.00.png)


**[Live Demo](https://michaelpaulukonis.github.io/polychrome.p5/)**


> Although the word polychrome is created from the combining of two Greek words, it was not used in ancient Greece. The term was coined in the early nineteenth century by Antoine Chrysostôme Quatremère de Quincy. ([source](https://en.wikipedia.org/wiki/Ancient_Greek_art#Polychromy))

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Advanced Features](#advanced-features)
- [Features & Capabilities](#features--capabilities)
  - [Core Features](#core-features)
  - [Roadmap](#roadmap)
- [Development Setup](#development-setup)
  - [Setup](#setup)
  - [Build and Test](#build-and-test)
- [Contributing](#contributing)
  - [Contributing Guidelines](#contributing-guidelines)
  - [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Getting Started

### Prerequisites

- **Node.js**: Version 20.0.0 or higher.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MichaelPaulukonis/polychrome.p5.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd polychrome.p5
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Quick Start

To run the application locally, use the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

### Basic Usage

Visit the [live demo](https://michaelpaulukonis.github.io/polychrome.p5/) and start painting! 

-   **Mouse Painting**: Click and drag on the canvas to paint with text.
-   **Keyboard Shortcuts**: An extensive system of hotkeys is available for power users. Hit cmd-S to save and FEEL THE POWER!
-   **Auto-Paint Mode**: Let the application generate art for you with randomized parameters. If you don't expect a masterpiece you'll happy.
-   **Recording and Playback**: Record, edit, and play back sequences of actions to create animations. This feature is currently under development and will be improved in future versions.

## Features & Capabilities

### Core Features

-   **Interactive Canvas**: Real-time visual feedback as you paint.
-   **Dynamic Color Palettes**: Generate and manipulate a wide range of color schemes.
-   **Multiple Drawing Modes**:
    -   **Grid**: Arrange text in a grid pattern.
    -   **Circle**: Place text along circular or arc-shaped paths.
    -   **RowCol**: A simple row and column layout.
-   **Save and Export**: Export your creations as PNG images.
-   **Layer Management**: A multi-canvas system with a drawing layer, main canvas, and temporary layers for complex compositions.
-   **Undo System**: A history management system for canvas states.

### Roadmap

-   **UI Overhaul**: A comprehensive redesign of the user interface for a more intuitive experience.
-   **Layer System**: First class layers to work and blend in different ways.
-   **TypeScript Migration**: Continue the migration to TypeScript for better type safety.
-   **Documentation**: Improve user and developer documentation.

## Development Setup

### Setup

To set up a local development environment, follow the [Installation](#installation) instructions.

### Build and Test

-   **Build for Production**:
    ```zsh
    npm run build
    ```
-   **Run Tests**:
    ```zsh
    npm test
    ```

## Contributing

Pull requests welcome - if you can sense out of this, your help is appreciated!

### Pull Request Process

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with a clear and descriptive message.
4.  Push your changes to your fork.
5.  Submit a pull request to the `main` branch of the original repository.


## Project Structure

The project is organized into the following key directories:

-   `/.github`: Instructional files for GitHub Copilot assistance.
-   `/assets`: Images, fonts, and other static assets.
-   `/components`: Vue components for the user interface.
-   `/docs`: Project documentation, including plans and analysis.
-   `/layouts`: Vue layout components.
-   `/modules`: Custom Nuxt modules.
-   `/pages`: Vue pages for the application.
-   `/plugins`: Vue plugins.
-   `/src`: The core source code for the application, including the p5.js sketch.
-   `/test`: Test files for the application, including unit and e2e tests.
-   `/tools`: Scripts for animating lots of images.

## Troubleshooting

If you encounter any issues, please check the [GitHub Issues](https://github.com/MichaelPaulukonis/polychrome.p5/issues) page to see if a similar problem has already been reported. If not, please open a new issue with a detailed description of the problem.

## License

This project is licensed under the MIT License. See the [LICENSE](https://opensource.org/licenses/MIT) file for details.

## Acknowledgments

-   This project was inspired by the work of Jackson Pollock, Mark Rothko, Allen Ginsberg and Andy Warhol.
-   This project makes use of several open-source libraries, including p5.js, Nuxt.js, and Quicksettings.
-   AI has been used for documentation, testing, refactoring and some coding.
