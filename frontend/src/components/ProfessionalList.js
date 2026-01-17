import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/professionals/';

function ProfessionalList() {
    const [professionals, setProfessionals] = useState([]);
    const [sourceFilter, setSourceFilter] = useState('');

    useEffect(() => {
        const fetchProfessionals = () => {
            let url = API_URL;
            if (sourceFilter) {
                url += `?source=${sourceFilter}`;
            }
            axios.get(url)
                .then(response => {
                    setProfessionals(response.data);
                })
                .catch(error => {
                    console.error('There was an error fetching the professionals!', error);
                });
        };
        fetchProfessionals();
    }, [sourceFilter]);

    return (
        <div>
            <h2>Professionals List</h2>
            <div>
                <label>Filter by Source: </label>
                <select onChange={(e) => setSourceFilter(e.target.value)} value={sourceFilter}>
                    <option value="">All</option>
                    <option value="direct">Direct</option>
                    <option value="partner">Partner</option>
                    <option value="internal">Internal</option>
                </select>
            </div>
            <table border="1" style={{ borderCollapse: 'collapse', width: '100%', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Company</th>
                        <th>Job Title</th>
                        <th>Source</th>
                    </tr>
                </thead>
                <tbody>
                    {professionals.map(prof => (
                        <tr key={prof.id}>
                            <td>{prof.full_name}</td>
                            <td>{prof.email}</td>
                            <td>{prof.phone}</td>
                            <td>{prof.company_name}</td>
                            <td>{prof.job_title}</td>
                            <td>{prof.source}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProfessionalList;
