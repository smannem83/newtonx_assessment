import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ProfessionalForm from './ProfessionalForm';

jest.mock('axios');

describe('ProfessionalForm', () => {
    it('renders the form correctly', () => {
        render(<ProfessionalForm />);
        
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Source/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });

    it('allows filling the form fields', () => {
        render(<ProfessionalForm />);
        
        act(() => {
            fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
        });
        
        expect(screen.getByLabelText(/Full Name/i).value).toBe('John Doe');
        expect(screen.getByLabelText(/Email/i).value).toBe('john.doe@example.com');
    });

    it('submits the form successfully with valid data', async () => {
        axios.post.mockResolvedValue({ data: {} });
        window.alert = jest.fn();

        render(<ProfessionalForm />);
        
        act(() => {
            fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
        });
        
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/professionals/'), {
                full_name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '',
                job_title: '',
                company_name: '',
                source: 'direct',
            });
            expect(window.alert).toHaveBeenCalledWith('Professional created successfully!');
        });
    });

    it('shows an error message when full name is missing', async () => {
        render(<ProfessionalForm />);
        
        act(() => {
            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
        });

        expect(await screen.findByText('Full name is required.')).toBeInTheDocument();
    });

    it('shows an error message when both email and phone are missing', async () => {
        render(<ProfessionalForm />);
        
        act(() => {
            fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
        });

        expect(await screen.findByText('Either Email or Phone is required.')).toBeInTheDocument();
    });

    it('shows an error message when the server returns an error', async () => {
        axios.post.mockRejectedValue({
            response: {
                data: { email: ['This email already exists.'] },
            },
        });

        render(<ProfessionalForm />);
        
        act(() => {
            fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john.doe@example.com' } });
        
            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
        });
        
        expect(await screen.findByText('This email already exists.')).toBeInTheDocument();
    });
});