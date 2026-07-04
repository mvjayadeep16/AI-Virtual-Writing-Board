<div align="center">

# 🖐️ AI Virtual Writing Board

### ✨ Draw in the Air Using AI Hand Tracking | OCR | PDF Export | Modern Web Technologies

<p align="center">
<img src="images\home.png" width="100%">
</p>

<br>

<img src="https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge">
<img src="https://img.shields.io/badge/Status-Completed-success?style=for-the-badge">
<img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge">
<img src="https://img.shields.io/badge/Open%20Source-❤-red?style=for-the-badge">

<br><br>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
<img src="https://img.shields.io/badge/MediaPipe-AI-red?style=for-the-badge">
<img src="https://img.shields.io/badge/Tesseract.js-OCR-blueviolet?style=for-the-badge">
<img src="https://img.shields.io/badge/jsPDF-PDF-success?style=for-the-badge">

<br><br>

⭐ If you like this project, don't forget to Star the Repository!

</div>

---

# 📖 About the Project

Artificial Intelligence is transforming the way humans interact with computers. Traditional writing methods require physical contact with input devices such as keyboards, styluses, or touch screens.

**AI Virtual Writing Board** introduces a completely touchless writing experience by allowing users to write in the air using only their index finger.

Using **MediaPipe Hand Tracking**, the application continuously detects hand landmarks through the webcam and transforms finger movements into smooth digital strokes on a virtual canvas.

The application also integrates **Optical Character Recognition (OCR)**, enabling handwritten content to be converted into editable digital text. Users can save their work as images or export it as professional PDF documents.

Designed with a clean and modern interface, this project demonstrates the integration of Artificial Intelligence, Computer Vision, and Web Technologies into an interactive real-time application.

---

# 🚀 Key Highlights

- ✨ Real-Time AI Hand Tracking
- 🖐️ Finger Gesture Recognition
- ✍️ Air Writing
- 🎨 Smooth Drawing Canvas
- 🌈 Multiple Brush Colors
- 🖌️ Adjustable Brush Size
- 🧽 Smart Eraser
- 🔤 OCR Text Recognition
- 📄 PDF Export
- 💾 Save Drawing as Image
- 🎯 Responsive UI
- ⚡ Fast Performance
- 🌙 Modern Dark Interface
- 📱 Mobile Friendly

---

# 📑 Table of Contents

- About Project
- Features
- Screenshot Gallery
- Project Workflow
- Technologies Used
- Installation
- Folder Structure
- Gesture Controls
- OCR Module
- PDF Export
- Browser Support
- Future Scope
- FAQ
- Contributing
- License
- Author

---

# 🌟 Why This Project?

Unlike traditional whiteboard applications, this project leverages **Artificial Intelligence** to eliminate the need for physical writing devices.

Instead of touching a screen or using a mouse, users simply move their finger in front of the webcam.

The system intelligently tracks the fingertip and converts every movement into digital handwriting.

This project combines multiple modern technologies into one seamless application:

- Computer Vision
- Artificial Intelligence
- Machine Learning
- Canvas API
- OCR
- PDF Generation
- Modern Web Development

making it an excellent demonstration project for students, developers, and AI enthusiasts.

---

# 🖼️ Application Preview

## 🏠 Home Screen

<p align="center">
<img src="images\home.png" width="90%">
</p>

---

## ✍️ Air Writing

<p align="center">
<img src="images\writing-mode.png" width="90%">
</p>

---

## 🤖 AI Hand Detection

<p align="center">
<img src="images\hand-detection.png" width="90%">
</p>

---

## 🎨 Toolbar

<p align="center">
<img src="images\toolbar.png" width="90%">
</p>

---

## 🌈 Color Selection

<p align="center">
<img src="images\color-selection.png" width="90%">
</p>

---

## 🧽 Eraser Tool

<p align="center">
<img src="images\eraiser.png" width="90%">
</p>

---

## 🔤 OCR Result

<p align="center">
<img src="images\ocr-result.png" width="90%">
</p>

---

## 📄 Export PDF

<p align="center">
<img src="images\pdf-export.png" width="90%">
</p>

---

## 🎥 Camera Permission

<p align="center">
<img src="images\camera-permission.png" width="70%">
</p>

---

## 📁 Project Structure

<p align="center">
<img src="images\project-structure.png" width="85%">
</p>

---

# ✨ Core Features

| Feature | Description |
|----------|------------|
| 🖐️ AI Hand Tracking | Detects hand landmarks in real time |
| ✍️ Air Writing | Draw naturally using your finger |
| 🎨 Drawing Canvas | Smooth handwriting experience |
| 🌈 Color Palette | Multiple drawing colors |
| 🖌️ Brush Size | Adjustable stroke width |
| 🧽 Eraser | Remove unwanted strokes |
| 🗑️ Clear Canvas | Reset the board instantly |
| 🔤 OCR | Convert handwriting into editable text |
| 📄 PDF Export | Export notes as PDF |
| 💾 Image Download | Save canvas as PNG |
| 📱 Responsive Design | Works across devices |
| ⚡ High Performance | Optimized rendering |

---
# 🏗️ System Architecture

The application follows a modular architecture where each component is responsible for a specific task.

```text
                    Webcam
                       │
                       ▼
              Camera Video Stream
                       │
                       ▼
           MediaPipe Hand Tracking
                       │
                       ▼
          Hand Landmark Detection
                       │
                       ▼
          Gesture Recognition Engine
                       │
       ┌───────────────┴────────────────┐
       ▼                                ▼
 Drawing Canvas                  Toolbar Actions
       │                                │
       ▼                                ▼
 Canvas API                     Color • Eraser • Clear
       │
       ▼
 OCR (Tesseract.js)
       │
       ▼
 Editable Text
       
├── │
       ▼
 PDF / PNG Export
```

---

# ⚙️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Web Page Structure |
| CSS3 | Modern Responsive Styling |
| JavaScript (ES6) | Application Logic |
| MediaPipe Hands | AI Hand Tracking |
| Canvas API | Digital Drawing Board |
| Tesseract.js | OCR (Text Recognition) |
| jsPDF | PDF Generation |
| WebRTC | Webcam Access |

---

# 📂 Project Structure

```text
AI-Virtual-Writing-Board/
│
├── 📁 images/
│   ├── camera-permission.png
│   ├── color-selection.png
│   ├── eraiser.png
│   ├── gesture-detection.png
│   ├── hand-detection.png
│   ├── hello AI.png
│   ├── home.png
│   ├── ocr-result.png
│   ├── pdf-export.png
│   ├── pdf-exporting.png
│   ├── project-structure.png
│   ├── toolbar.png
│   └── writing-mode.png
│
├── 📁 js/
│   ├── app.js
│   ├── camera.js
│   ├── canvas.js
│   ├── constants.js
│   ├── gestures.js
│   └── utils.js
│
├── 📄 index.html
├── 📄 README.md
└── 📄 style.css
```

---

# 🚀 Getting Started

Follow these simple steps to run the project on your local machine.

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/mvjayadeep16/AI-Virtual-Writing-Board.git
```

---

## 2️⃣ Open the Project

```bash
cd AI-Virtual-Writing-Board
```

---

## 3️⃣ Launch the Application

Open the project using **Visual Studio Code**.

Install the **Live Server** extension if you haven't already.

Right-click on **index.html** and select:

```
Open with Live Server
```

The application will automatically open in your default browser.

---

# 📸 Grant Camera Permission

When the application starts, your browser will ask for webcam access.

Click **Allow**.

<p align="center">
<img src="images\camera-permission.png" width="70%">
</p>

Without camera permission, hand tracking cannot function.

---

# ▶️ How to Use

### Step 1

Open the application.

---

### Step 2

Allow webcam access.

---

### Step 3

Place your hand in front of the camera.

---

### Step 4

The AI detects your hand automatically.

---

### Step 5

Move your index finger to start writing.

---

### Step 6

Use the toolbar to customize your drawing.

---

### Step 7

Select different colors.

---

### Step 8

Erase mistakes whenever needed.

---

### Step 9

Recognize handwritten text using OCR.

---

### Step 10

Export your work as a PDF.

---

# 🖐️ Gesture Controls

| Gesture | Function |
|----------|----------|
| ☝️ Index Finger | Draw on the canvas |
| ✋ Open Palm | Pause drawing |
| 🤏 Pinch | Select toolbar options *(if implemented)* |
| ✊ Closed Hand | Stop interaction *(if implemented)* |

> **Note:** Update this table if your project uses different gestures.

---

# 🎯 Application Workflow

```text
Launch Application
        │
        ▼
Grant Camera Permission
        │
        ▼
AI Detects Hand
        │
        ▼
Recognize Finger Gesture
        │
        ▼
Draw on Virtual Canvas
        │
        ▼
Select Drawing Tools
        │
        ▼
Convert Handwriting to Text
        │
        ▼
Export as PDF / PNG
```

---

# 🔍 OCR (Optical Character Recognition)

OCR converts handwritten text drawn on the canvas into editable digital text.

### Example

```
Canvas Drawing

Hello AI
```

⬇

```
Recognized Text

Hello AI
```

<p align="center">
<img src="images\hello AI.png" width="85%">
</p>

This feature makes handwritten notes searchable, editable, and easy to copy into other applications.

---

# 📄 PDF Export

After completing your writing or drawing, click the **Export PDF** button to generate a downloadable PDF document.

<p align="center">
<img src="images\pdf-export.png" width="85%">
</p>

This is useful for:

- 📚 Study Notes
- 📝 Assignments
- 📄 Documentation
- 📋 Meeting Notes
- 🎨 Sketches

---
# 📱 Responsive Design

The application is designed to work seamlessly across different screen sizes.

| Device | Support |
|---------|----------|
| 💻 Desktop | ✅ Fully Supported |
| 🖥️ Laptop | ✅ Fully Supported |
| 📱 Mobile | ✅ Responsive |
| 📲 Tablet | ✅ Responsive |

<p align="center">
<img src="screenshots/mobile-view.png" width="40%">
</p>

---

# 🌐 Browser Compatibility

| Browser | Supported |
|----------|-----------|
| Google Chrome | ✅ Recommended |
| Microsoft Edge | ✅ Supported |
| Brave | ✅ Supported |
| Opera | ✅ Supported |
| Mozilla Firefox | ⚠️ Limited (camera performance may vary) |
| Safari | ⚠️ Experimental |

---

# ⚡ Performance Highlights

✔ Real-Time Hand Tracking

✔ Smooth Canvas Rendering

✔ Low Latency Gesture Detection

✔ Fast OCR Processing

✔ Instant PDF Export

✔ Lightweight Frontend

✔ Responsive User Interface

✔ Optimized JavaScript Modules

---

# 🚀 Future Enhancements

This project has been designed with future scalability in mind.

### Planned Features

- 🌙 Light/Dark Theme Switch
- 🎤 Voice Commands
- ☁️ Cloud Storage Integration
- 👥 Multi-User Collaboration
- 🧠 AI Shape Recognition
- 📐 Auto Shape Detection
- ✍️ Handwriting Beautification
- 🌍 Multi-Language OCR
- 🔊 Speech-to-Text
- 📚 Save Projects Locally
- 🔐 User Authentication
- 🤖 AI Writing Assistant

---

# 🎯 Real-World Applications

This project can be used in various domains such as:

- 📚 Smart Education
- 🏫 Digital Classrooms
- 👨‍🏫 Online Teaching
- 💼 Business Presentations
- 📊 Meetings & Brainstorming
- 🎨 Digital Sketching
- ✍️ Note Taking
- 💡 Idea Visualization
- 📖 Research Work
- 🖥️ Human-Computer Interaction

---

# ❓ Frequently Asked Questions

<details>

<summary><strong>How does the application detect my hand?</strong></summary>

The project uses Google's **MediaPipe Hands** model to detect and track hand landmarks in real time through your webcam.

</details>

---

<details>

<summary><strong>Does the project require an internet connection?</strong></summary>

No. Once all required libraries are loaded, the application can run locally using Live Server.

</details>

---

<details>

<summary><strong>Why is my camera not working?</strong></summary>

Please ensure:

- Camera permission is allowed.
- No other application is using the webcam.
- You are using a supported browser.
- HTTPS or Localhost is used for camera access.

</details>

---

<details>

<summary><strong>Can I export my writing?</strong></summary>

Yes.

The application allows exporting:

- PDF Documents
- PNG Images

</details>

---

<details>

<summary><strong>Can I recognize handwritten text?</strong></summary>

Yes.

The OCR module converts handwritten content into editable digital text.

</details>

---

# 🧪 Troubleshooting

### Camera Permission Denied

Refresh the page and allow webcam access.

---

### Hand Not Detected

- Improve lighting.
- Keep your hand inside the camera frame.
- Avoid a cluttered background.

---

### OCR Accuracy is Low

Write clearly using larger strokes.

---

### PDF is Empty

Ensure something has been drawn before exporting.

---

# 🤝 Contributing

Contributions are always welcome!

### Steps

1. Fork this repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added a new feature"
```

4. Push your branch

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# ⭐ Support the Project

If you found this project useful,

please consider giving it a ⭐ on GitHub.

Every star motivates me to build better open-source projects.

---

# 📜 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project for educational and personal purposes.

---

# 👨‍💻 Developer

<div align="center">

## Venkata Jayadeep Maddipatla

🎓 B.Tech Computer Science & Engineering

SRM Institute of Science and Technology

Chennai, India

</div>

---

## 📬 Connect With Me

<p align="center">

<a href="https://github.com/mvjayadeep16">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

<a href="https://www.linkedin.com/in/venkata-jayadeep-maddipatla-b1a111385/">
<img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin">
</a>

<a href="mailto:mvjayadeep16@gmail.com">
<img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail">
</a>

</p>

---

# 🙏 Acknowledgements

Special thanks to the amazing open-source community and the developers behind:

- Google MediaPipe
- Tesseract.js
- jsPDF
- HTML5 Canvas API

Their incredible tools made this project possible.

---

# 🌟 Repository Stats

If you like this project, don't forget to:

⭐ Star the repository

🍴 Fork the repository

📢 Share it with others

💬 Provide feedback

---

<div align="center">

# 🎉 Thank You for Visiting!

<img src="https://readme-typing-svg.demolab.com?font=Poppins&size=24&pause=1000&color=00D9FF&center=true&vCenter=true&width=700&lines=Thanks+for+visiting+my+repository!;Happy+Coding!;Keep+Building+Amazing+Projects!;AI+Virtual+Writing+Board+🚀">

### 💙 Built with Passion using HTML, CSS, JavaScript & Artificial Intelligence

### ⭐ Star this repository if you enjoyed it!

</div>

---

<div align="center">

# 🌟 Show Your Support

If you found this project helpful or learned something from it, please consider supporting it.

⭐ Star this repository

🍴 Fork this repository

🐛 Report Issues

💡 Suggest New Features

📢 Share it with your friends

Your support motivates me to build more amazing open-source projects.

<br>

<a href="https://github.com/mvjayadeep16">
<img src="https://img.shields.io/badge/Follow%20Me%20on-GitHub-181717?style=for-the-badge&logo=github">
</a>

</div>

---


# 🔥 GitHub Streak

<div align="center">

<img src="https://streak-stats.demolab.com?user=mvjayadeep16&theme=tokyonight&hide_border=true"/>

</div>

---

# 🏆 GitHub Trophies

<div align="center">

<img src="https://github-profile-trophy.vercel.app/?username=mvjayadeep16&theme=tokyonight&column=4&margin-w=15&margin-h=15"/>

</div>

---

# 📈 Repository Activity

<div align="center">

<img src="https://github-readme-activity-graph.vercel.app/graph?username=mvjayadeep16&theme=tokyo-night"/>

</div>

---

# 💻 Project Highlights

> ✔ AI Powered Hand Tracking

> ✔ Computer Vision Based Drawing

> ✔ OCR Text Recognition

> ✔ PDF Export

> ✔ Responsive User Interface

> ✔ Modern JavaScript Architecture

> ✔ Clean & Modular Codebase

> ✔ Beginner Friendly

> ✔ Open Source

---

# 🎓 Learning Outcomes

This project helped me gain practical experience in:

- Artificial Intelligence
- Computer Vision
- Human Computer Interaction
- JavaScript Programming
- Canvas API
- MediaPipe Hands
- OCR using Tesseract.js
- PDF Generation
- UI/UX Design
- Responsive Web Development
- Git & GitHub
- Open Source Development


# 💡 Did You Know?

This application processes hand movements in real time and converts them into digital writing using AI-based hand landmark detection.

It demonstrates how modern browser technologies can combine with Artificial Intelligence to create intuitive, touchless user experiences.

---

<div align="center">

## 🚀 AI Virtual Writing Board

### Built with ❤️ by

# Venkata Jayadeep Maddipatla

**B.Tech – Computer Science and Engineering**

SRM Institute of Science and Technology

Chennai, Tamil Nadu, India

---

### ⭐ Thanks for visiting my repository!

### If you enjoyed this project, please leave a ⭐.

<img src="https://capsule-render.vercel.app/api?type=waving&height=120&color=0:00C6FF,100:0072FF&section=footer"/>

</div>