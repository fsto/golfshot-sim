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
    expect(screen.getByText('Ball Launch')).toBeInTheDocument();
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
