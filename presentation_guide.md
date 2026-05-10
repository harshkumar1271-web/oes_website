# PowerPoint Generation Guide

To get a real `.pptx` file, you can use the VBA script below or follow the manual outline.

## Option 1: Automatic Generation (VBA Script)

1. Open **Microsoft PowerPoint**.
2. Press `Alt + F11` to open the VBA Editor.
3. Go to `Insert` -> `Module`.
4. Paste the following code:

```vba
Sub CreateOESPresentation()
    Dim pptApp As Object
    Dim pptPres As Object
    Dim slideIndex As Integer
    
    Set pptApp = Application
    Set pptPres = pptApp.Presentations.Add
    
    ' Slide 1: Title
    AddSlide pptPres, "Online Exam System", "A Modern, Secure, and Efficient Digital Assessment Platform" & vbCrLf & "Presented by: Team OES"
    
    ' Slide 2: Introduction
    AddSlide pptPres, "Project Overview", "The Online Exam System (OES) is a full-stack web application designed to simplify the examination process." & vbCrLf & _
        "- Automates exam scheduling and grading." & vbCrLf & _
        "- Provides a real-time, responsive testing environment." & vbCrLf & _
        "- Ensures data integrity and secure access."
        
    ' Slide 3: Tech Stack
    AddSlide pptPres, "Technology Stack", "Frontend: HTML5, CSS3, JavaScript" & vbCrLf & _
        "Backend: Node.js, Express.js" & vbCrLf & _
        "Database: MongoDB (Mongoose)" & vbCrLf & _
        "Security: JWT, Bcryptjs"
        
    ' Slide 4: Student Features
    AddSlide pptPres, "Student Features", "- Secure Login/Signup with JWT" & vbCrLf & _
        "- Interactive Exam Interface with Timer" & vbCrLf & _
        "- Instant Results and Score Tracking" & vbCrLf & _
        "- Mobile-Responsive Design"
        
    ' Slide 5: Admin Features
    AddSlide pptPres, "Admin Dashboard", "- Question Management (Add/Edit/Delete)" & vbCrLf & _
        "- Student Result Monitoring" & vbCrLf & _
        "- System Analytics and Records Management"
        
    ' Slide 6: Security
    AddSlide pptPres, "Security Architecture", "- Password Encryption using Bcrypt" & vbCrLf & _
        "- Protected API Routes using JWT" & vbCrLf & _
        "- Role-Based Access Control (Admin vs Student)"
        
    ' Slide 7: UI/UX
    AddSlide pptPres, "Modern UI/UX Design", "- Sleek Glassmorphism Effects" & vbCrLf & _
        "- Dark Mode for better accessibility" & vbCrLf & _
        "- Intuitive Navigation and User Flow"
        
    ' Slide 8: Future Scope
    AddSlide pptPres, "Future Enhancements", "- AI-based Proctoring" & vbCrLf & _
        "- Automated PDF Certificates" & vbCrLf & _
        "- Multi-media Question Support"
        
    ' Slide 9: Conclusion
    AddSlide pptPres, "Thank You!", "Questions? We'd love to hear your feedback." & vbCrLf & "Online Exam System v1.0.0"
    
    MsgBox "Presentation Created Successfully!", vbInformation
End Sub

Sub AddSlide(pres As Object, titleText As String, bodyText As String)
    Dim sld As Object
    Set sld = pres.Slides.Add(pres.Slides.Count + 1, 2) ' 2 = ppLayoutText
    sld.Shapes.title.TextFrame.TextRange.Text = titleText
    sld.Shapes.Placeholders(2).TextFrame.TextRange.Text = bodyText
End Sub
```

5. Press `F5` to run the script. It will create a new PowerPoint file with all the slides!

---

## Option 2: Manual Outline (Markdown)

# Online Exam System
## A Modern, Secure, and Efficient Digital Assessment Platform

### 1. Introduction
- Full-stack web application.
- Simplifies exam process for institutions and students.
- Automated grading and secure data handling.

### 2. Technology Stack
- **Frontend**: HTML5, CSS3, JS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT & Bcrypt.

### 3. Key Features
- **Student**: Secure login, taking exams, instant results.
- **Admin**: Managing questions, monitoring results, record deletion.

### 4. Security
- Encrypted passwords.
- Role-based route protection.
- Secure token handling.

### 5. Future Scope
- AI Proctoring.
- PDF Result Reports.
- Image/Video questions.
