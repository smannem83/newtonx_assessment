import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/professionals/';

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
                if (error.response && error.response.data) {
                    console.error('There was an error creating the professional!', error.response.data);
                    setErrors(error.response.data);
                } else {
                    console.error('An unexpected error occurred!', error);
                    setErrors({ non_field_errors: 'An unexpected error occurred. Please try again.' });
                }
            });
    };

    return (
        <div>
            <h2>Add Professional</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="full_name">Full Name:</label>
                    <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} />
                    {errors.full_name && <p style={{ color: 'red' }}>{errors.full_name}</p>}
                </div>

                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                    {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="phone">Phone:</label>
                    <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                    {errors.phone && <p style={{ color: 'red' }}>{errors.phone}</p>}
                </div>

                <div>
                    <label htmlFor="job_title">Job Title:</label>
                    <input type="text" id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} />
                    {errors.job_title && <p style={{ color: 'red' }}>{errors.job_title}</p>}
                </div>

                <div>
                    <label htmlFor="company_name">Company Name:</label>
                    <input type="text" id="company_name" name="company_name" value={formData.company_name} onChange={handleChange} />
                    {errors.company_name && <p style={{ color: 'red' }}>{errors.company_name}</p>}
                </div>

                <div>
                    <label htmlFor="source">Source:</label>
                    <select id="source" name="source" value={formData.source} onChange={handleChange}>
                        <option value="direct">Direct</option>
                        <option value="partner">Partner</option>
                        <option value="internal">Internal</option>
                    </select>
                    {errors.source && <p style={{ color: 'red' }}>{errors.source}</p>}
                </div>
                
                {errors.non_field_errors && <p style={{ color: 'red' }}>{errors.non_field_errors}</p>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default ProfessionalForm;
