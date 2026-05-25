import { describe, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useShotStore } from '../state/shotStore';

// Three.js / r3f need WebGL; stub the scene out for jsdom tests.
vi.mock('./scene/Scene', () => ({
  Scene: () => <div data-testid="scene-stub" />,
}));

const { App } = await import('./App');

beforeEach(() => {
  useShotStore.getState().reset();
});

describe('App smoke', () => {
  test('renders title, input panels, readout', () => {
    render(<App />);
    expect(screen.getByText('Golfshot Sim')).toBeInTheDocument();
    expect(screen.getByText('Ball Launch', { selector: '.panel-title' })).toBeInTheDocument();
    expect(screen.getByText('Environment')).toBeInTheDocument();
    // Five readout stats
    expect(screen.getByText('Carry')).toBeInTheDocument();
    expect(screen.getByText('Apex')).toBeInTheDocument();
    expect(screen.getByText('Hang time')).toBeInTheDocument();
  });

  test('Carry readout shows ~275 yd by default (Tour driver preset)', () => {
    render(<App />);
    const carryStat = screen.getByText('Carry').closest('.stat') as HTMLElement;
    const value = within(carryStat).getByText(/\d+\.\d+/);
    const n = parseFloat(value.textContent ?? '');
    expect(n).toBeGreaterThan(260);
    expect(n).toBeLessThan(290);
  });

  test('switching to metric flips the carry to meters', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Metric' }));
    const carryStat = screen.getByText('Carry').closest('.stat') as HTMLElement;
    const value = within(carryStat).getByText(/\d+\.\d+/);
    const n = parseFloat(value.textContent ?? '');
    // 277 yd ≈ 253 m
    expect(n).toBeGreaterThan(240);
    expect(n).toBeLessThan(265);
  });

  test('toggling to Club Delivery shows the derived ball launch panel', () => {
    render(<App />);
    expect(screen.queryByText(/Derived ball launch/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Club Delivery' }));
    expect(screen.getByText(/Derived ball launch/i)).toBeInTheDocument();
    expect(screen.getByText('Club Delivery', { selector: '.panel-title' })).toBeInTheDocument();
  });

  test('selecting 7i preset in delivery mode changes derived launch angle from driver value', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Club Delivery' }));
    // Default delivery is driver; derived launch ≈ 10.9°.
    // Change preset to 7-iron (expected derived launch ≈ 19.4°).
    const select = screen.getByLabelText(/Club preset/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '7i' } });
    // Find the row labelled "Launch angle" inside the derived panel and read its value
    const launchRow = screen.getByText('Launch angle').closest('.derived-row') as HTMLElement;
    const valueText = within(launchRow).getByText(/\d+\.\d+/).textContent ?? '';
    const v = parseFloat(valueText);
    expect(v).toBeGreaterThan(18);
    expect(v).toBeLessThan(21);
  });

  test('reducing backspin to 0 shortens carry', () => {
    render(<App />);
    const carryStat = () => screen.getByText('Carry').closest('.stat') as HTMLElement;
    const carryValue = () => parseFloat(within(carryStat()).getByText(/\d+\.\d+/).textContent ?? '');
    const initial = carryValue();

    // Find the backspin numeric input (rpm field with value 2685)
    const backspinInputs = screen.getAllByRole('spinbutton');
    const backspin = backspinInputs.find((el) => (el as HTMLInputElement).value === '2685');
    expect(backspin).toBeDefined();
    fireEvent.change(backspin!, { target: { value: '0' } });

    const after = carryValue();
    // No-spin driver loses a lot of carry due to no Magnus lift
    expect(after).toBeLessThan(initial - 30);
  });
});
