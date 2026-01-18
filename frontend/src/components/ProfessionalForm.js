import React, { useState } from 'react';
import axios from 'axios';

import './ProfessionalForm.css'; // Import the CSS file
const API_URL = `${process.env.REACT_APP_API_URL}/professionals/`;

function ProfessionalForm() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        job_title: '',
        company_name: '',
        source: 'direct',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false); // New loading state

    const validate = () => {
        const newErrors = {};
        if (!formData.full_name) {
            newErrors.full_name = 'Full name is required.';
        }
        if (!formData.email && !formData.phone) {
            newErrors.non_field_errors = 'Either Email or Phone is required.';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clear previous errors
        setErrors({});
        // Client-side validation
        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) {
            setErrors(clientErrors);
            return;
        }

        setIsLoading(true); // Set loading to true before request
        axios.post(API_URL, formData)
            .then(response => {
                console.log('Professional created:', response.data);
                // Reset form and errors
                setFormData({
                    full_name: '',
                    email: '',
                    phone: '',
                    job_title: '',
                    company_name: '',
                    source: 'direct',
                });
                setErrors({});
                alert('Professional created successfully!');
            })
            .catch(error => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Server Error:', error.response);
                    if (typeof error.response.data === 'object' && error.response.data !== null) {
                        // If the error data is a structured object (e.g., DRF validation errors)
                        setErrors(error.response.data);
                    } else {
                        // If the error data is not an object (e.g., plain text 500 error, or empty data)
                        // Use a generic message or the raw data if available
                        const errorMessage = error.response.data || `Server responded with status ${error.response.status}.`;
                        setErrors({ non_field_errors: errorMessage });
                    }
                } else if (error.request) {
                    // The request was made but no response was received (e.g., network error)
                    console.error('Network Error:', error.request);
                    setErrors({ non_field_errors: 'Network error. Please check your internet connection.' });
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.error('Request Setup Error:', error.message);
                    setErrors({ non_field_errors: 'An unexpected error occurred. Please try again.' });
                }
            })
            .finally(() => {
                setIsLoading(false); // Ensure loading is false even if catch block re-throws or has its own issues
            });
    };

    return (
        <> {/* Using a React Fragment as the root element */}
            <div className="professional-form-container">
                <h2>Add Professional</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                    <label htmlFor="full_name">Full Name:</label>
                    <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
                    {errors.full_name && <p className="error-message">{errors.full_name}</p>}
                </div>

                    <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <p className="error-message">{errors.email}</p>}
                </div>

                    <div className="form-group">
                    <label htmlFor="phone">Phone:</label>
                    <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    {errors.phone && <p className="error-message">{errors.phone}</p>}
                </div>

                    <div className="form-group">
                    <label htmlFor="job_title">Job Title:</label>
                    <input type="text" id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} />
                    {errors.job_title && <p className="error-message">{errors.job_title}</p>}
                </div>

                    <div className="form-group">
                    <label htmlFor="company_name">Company Name:</label>
                    <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} />
                    {errors.company_name && <p className="error-message">{errors.company_name}</p>}
                </div>

                    <div className="form-group">
                    <label htmlFor="source">Source:</label>
                    <select id="source" name="source" value={formData.source} onChange={handleChange}>
                        <option value="direct">Direct</option>
                        <option value="partner">Partner</option>
                        <option value="internal">Internal</option>
                    </select>
                    {errors.source && <p className="error-message">{errors.source}</p>}
                </div>
                
                    {errors.non_field_errors && <p className="error-message">{errors.non_field_errors}</p>}
                    <button type="submit" disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit'}</button>
                </form>
            </div>
        </>
    );
}

export default ProfessionalForm;
