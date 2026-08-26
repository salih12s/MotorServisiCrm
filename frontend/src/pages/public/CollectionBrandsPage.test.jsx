import React from 'react';
import { render, screen } from '@testing-library/react';
import CollectionBrandsPage from './CollectionBrandsPage';

jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
jest.mock('../../components/PublicNav', () => () => <nav>Navigation</nav>);
jest.mock('../../components/SiteFooter', () => () => <footer>Footer</footer>);

test('renders the Falcon and Musatti cards at the responsive collection entry', () => {
  render(<CollectionBrandsPage />);
  expect(screen.getByText('Falcon Koleksiyonunu Keşfet')).toBeInTheDocument();
  expect(screen.getByText('Musatti Koleksiyonunu Keşfet')).toBeInTheDocument();
  expect(screen.getByText(/Falcon motosiklet, scooter, ATV ve elektrikli modellerinin tamamını/)).toBeInTheDocument();
});
