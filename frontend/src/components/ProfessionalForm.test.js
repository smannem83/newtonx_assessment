import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfessionalForm from './ProfessionalForm';
import axios from 'axios';

jest.mock('axios');

describe('ProfessionalForm', () => {
    test('renders the form correctly', () => {
        render(<ProfessionalForm />);
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    test('shows client-side validation error for empty full name', async () => {
        render(<ProfessionalForm />);
        await userEvent.click(screen.getByRole('button', { name: /submit/i }));
        
        expect(await screen.findByText('Full name is required.')).toBeInTheDocument();
    });

    test('shows client-side validation error for missing email and phone', async () => {
        render(<ProfessionalForm />);
        await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
        await userEvent.click(screen.getByRole('button', { name: /submit/i }));

        expect(await screen.findByText('Either Email or Phone is required.')).toBeInTheDocument();
    });

    test('submits successfully with valid data and clears the form', async () => {
        axios.post.mockResolvedValue({ data: { id: 1, full_name: 'John Doe' } });
        window.alert = jest.fn(); // Mock the alert

        render(<ProfessionalForm />);
        await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.click(screen.getByRole('button', { name: /submit/i }));

        // Check that the form was submitted
        expect(axios.post).toHaveBeenCalledTimes(1);

        // Check that the form is cleared
        await waitFor(() => {
            expect(screen.getByLabelText(/Full Name/i)).toHaveValue('');
        });
        expect(window.alert).toHaveBeenCalledWith('Professional created successfully!');
    });

    test('displays backend validation errors', async () => {
        const errors = {
            email: ['Enter a valid email address.'],
            phone: ['A professional with this phone already exists.'],
        };
        axios.post.mockRejectedValue({ response: { data: errors } });

        render(<ProfessionalForm />);
        await userEvent.type(screen.getByLabelText(/Full Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane'); // Invalid email
        await userEvent.type(screen.getByLabelText(/Phone/i), '1234567890'); // Existing phone
        await userEvent.click(screen.getByRole('button', { name: /submit/i }));

        // Check that the backend errors are displayed
        expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
        expect(await screen.findByText('A professional with this phone already exists.')).toBeInTheDocument();
    });
});
