# Future Extension: PDF Resume Parsing

This document outlines a proposed architecture for adding a feature that allows users to upload a PDF resume, which is then automatically parsed to populate the professional's profile information.

### 1. How the system would process and interpret the PDF content

This is a multi-step process that involves parsing the PDF to extract raw text and then interpreting that text to pull out structured information.

#### A. PDF Parsing & Text Extraction
The first step is to get the text out of the PDF. The backend would use a specialized Python library for this. The recommended choice is **`pdfplumber`**, as it is excellent at not only extracting raw text but also understanding the layout, which is crucial for interpreting a resume's structure.

#### B. Content Interpretation (Information Extraction)
Once the raw text is available, the real challenge is to make sense of it. This is a Natural Language Processing (NLP) task. A robust solution would use a hybrid approach:

1.  **Rule-Based Extraction for High-Confidence Fields:** Use Regular Expressions (regex) to reliably find data with predictable formats:
    *   **Email:** A regex can easily find strings matching the `name@domain.com` pattern.
    *   **Phone Number:** A regex can be crafted to find various phone number formats. The number would then be cleaned and standardized.

2.  **AI-Based Extraction for Complex Fields:** For less structured data like names, job titles, and company history, an AI-powered approach is necessary.
    *   **Named Entity Recognition (NER):** Use a library like **`spaCy`**. Its pre-trained models are very effective at identifying entities like `PERSON` (for the candidate's name), `ORG` (for company and university names), and `DATE`.
    *   **Section Parsing:** The system would look for common resume headers (e.g., "Work Experience", "Education", "Skills") to divide the document into logical sections. The text within each section can then be analyzed in context. For example, text under "Work Experience" identified as an `ORG` is likely a company name.

#### C. Asynchronous Processing with a Task Queue
PDF parsing and NLP are too slow to run during a live API request. This would lead to request timeouts and a poor user experience. Therefore, the entire process must be handled asynchronously.

*   **The Flow:**
    1.  The user uploads the PDF. The API saves the file and immediately creates a `Professional` record with a status like "Processing".
    2.  The API instantly responds with a `202 Accepted` status, letting the client know the request was received but is not yet complete.
    3.  A background job is added to a task queue. For a Django project, **Celery** is the industry-standard tool for this.
    4.  A Celery worker process, running separately, picks up the job. It performs the parsing and NLP steps described above.
    5.  Once finished, the worker updates the `Professional` record in the database with the extracted information and changes its status to "Completed" or "Failed".

### 2. What is the proposed method for handling the file upload?

Handling the file itself involves changes to the model, the API, and the file storage configuration.

*   **Model:** Add a `FileField` to the `Professional` model in `models.py`:
    ```python
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    ```
*   **API:** The `Professional` API endpoint would be updated to accept `multipart/form-data`, which is the standard for file uploads. Django REST Framework's `ModelSerializer` handles this seamlessly when a `FileField` is present.
*   **File Storage:**
    *   **Development:** For local development, files would be stored in a `media/resumes/` directory.
    *   **Production:** In a production environment, it is crucial not to store user-uploaded files on the same server that runs the application. The standard solution is to use a cloud storage service like **Amazon S3**. The `django-storages` library would be used to handle this.

### 3. What additional frontend functionalities would be needed?

The frontend would need several new elements to provide a good user experience for file uploading.

*   **File Input Element:** The form in `ProfessionalForm.js` would be updated with an `<input type="file" accept=".pdf" />`.
*   **Enhanced Upload UI:** To improve upon the basic file input, the following could be implemented:
    *   A "drag-and-drop" area.
    *   A display showing the name and size of the selected file.
    *   A button to remove the selected file before uploading.
*   **Form Submission:** The form submission logic would be changed to send the data as `multipart/form-data` using the `FormData` object.
*   **Asynchronous Feedback:** Since the backend processing is asynchronous, the UI needs to reflect this:
    *   Upon successful upload, the UI would show a message like, "Resume uploaded. We are processing the content."
    *   On the "Professionals List" page, a "Resume Status" column could be added, showing a real-time status like "Processing", "Completed", or "Failed". This could be implemented by having the frontend periodically poll the API for the status.
