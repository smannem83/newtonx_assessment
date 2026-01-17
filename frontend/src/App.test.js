import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import axios from 'axios';

jest.mock('axios');

test('renders the main page with navigation and the add form by default', async () => {
  axios.get.mockResolvedValue({ data: [] });
  render(<App />);
  
  // Check for navigation links
  expect(screen.getByRole('link', { name: /Add Professional/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /View Professionals/i })).toBeInTheDocument();
  
  // By default, the /add route should be active, let's check for a form field
  expect(await screen.findByLabelText(/Full Name/i)).toBeInTheDocument();
});

test('navigates to the professional list and renders it', async () => {
    const professionals = [
        { id: 1, full_name: 'John Doe', email: 'john@example.com', phone: '111', company_name: 'A', job_title: 'Dev', source: 'direct' },
        { id: 2, full_name: 'Jane Doe', email: 'jane@example.com', phone: '222', company_name: 'B', job_title: 'Eng', source: 'partner' },
    ];
    axios.get.mockResolvedValue({ data: professionals });
    
    render(<App />);
    
    // Click on the "View Professionals" link
    await userEvent.click(screen.getByRole('link', { name: /View Professionals/i }));

    // Check that the list is rendered
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
});

test('navigates back to the form page', async () => {
    axios.get.mockResolvedValue({ data: [] });
    render(<App />);

    // Go to the list first
    await userEvent.click(screen.getByRole('link', { name: /View Professionals/i }));
    expect(await screen.findByText(/Filter by Source/i)).toBeInTheDocument();

    // Go back to the add form
    await userEvent.click(screen.getByRole('link', { name: /Add Professional/i }));
    expect(await screen.findByLabelText(/Full Name/i)).toBeInTheDocument();
});
