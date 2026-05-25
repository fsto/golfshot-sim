import { describe, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useShotStore } from '../state/shotStore';
import { useHistoryStore } from '../state/historyStore';

// Three.js / r3f need WebGL; stub the scene out for jsdom tests.
vi.mock('./scene/Scene', () => ({
  Scene: () => <div data-testid="scene-stub" />,
}));

const { App } = await import('./App');

beforeEach(() => {
  useShotStore.getState().reset();
  useHistoryStore.getState().clear();
});

describe('App smoke', () => {
  test('renders title, input panels, readout (Club Delivery is default)', () => {
    render(<App />);
    expect(screen.getByText('Golfshot Sim')).toBeInTheDocument();
    expect(screen.getByText('Club Delivery', { selector: '.panel-title' })).toBeInTheDocument();
    expect(screen.getByText('Environment')).toBeInTheDocument();
    expect(screen.getByText('Carry')).toBeInTheDocument();
    expect(screen.getByText('Apex')).toBeInTheDocument();
    expect(screen.getByText('Hang time')).toBeInTheDocument();
  });

  test('Carry readout shows ~253 m by default (metric default, Tour driver preset)', () => {
    render(<App />);
    const carryStat = screen.getByText('Carry').closest('.stat') as HTMLElement;
    const value = within(carryStat).getByText(/\d+\.\d+/);
    const n = parseFloat(value.textContent ?? '');
    // 277 yd ≈ 253 m
    expect(n).toBeGreaterThan(240);
    expect(n).toBeLessThan(265);
  });

  test('switching to Imperial flips the carry to yards', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Imperial' }));
    const carryStat = screen.getByText('Carry').closest('.stat') as HTMLElement;
    const value = within(carryStat).getByText(/\d+\.\d+/);
    const n = parseFloat(value.textContent ?? '');
    expect(n).toBeGreaterThan(260);
    expect(n).toBeLessThan(290);
  });

  test('Total readout shows farther than Carry (bounce + roll add distance)', () => {
    render(<App />);
    const num = (label: string) =>
      parseFloat(
        within(screen.getByText(label).closest('.stat') as HTMLElement)
          .getByText(/\d+\.\d+/).textContent ?? '',
      );
    expect(num('Total')).toBeGreaterThan(num('Carry'));
  });

test('Share link button is in the header', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
  });

  test('Dispersion panel renders with delivery-mode σ sliders and Run button by default', () => {
    render(<App />);
    expect(screen.getByText('Dispersion (Monte-Carlo)')).toBeInTheDocument();
    expect(screen.getByText(/σ Club speed/)).toBeInTheDocument();
    expect(screen.getByText(/σ Face angle/)).toBeInTheDocument();
    expect(screen.getByText(/σ Club path/)).toBeInTheDocument();
    expect(screen.getByText(/σ Attack angle/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run dispersion/i })).toBeInTheDocument();
  });

  test('Dispersion panel switches σ field set when toggling to Ball Launch', () => {
    render(<App />);
    expect(screen.queryByText(/σ Spin axis/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ball Launch' }));
    expect(screen.getByText(/σ Ball speed/)).toBeInTheDocument();
    expect(screen.getByText(/σ Spin axis/)).toBeInTheDocument();
    expect(screen.getByText(/σ Azimuth/)).toBeInTheDocument();
    expect(screen.getByText(/σ Backspin/)).toBeInTheDocument();
  });

  test('Save Shot adds a chip with label and total; Clear all empties history', () => {
    render(<App />);
    expect(screen.queryByText(/Saved shots/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Save Shot/i }));
    expect(screen.getByText(/Saved shots \(1\)/i)).toBeInTheDocument();
    // Default mode is delivery → label starts with "Driver" (current preset)
    expect(screen.getByText(/Driver #1/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Save Shot/i }));
    expect(screen.getByText(/Saved shots \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Driver #2/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Clear all/i }));
    expect(screen.queryByText(/Saved shots/i)).toBeNull();
  });

  test('switching surface to Rough cuts total distance vs Fairway', () => {
    render(<App />);
    const totalNum = () =>
      parseFloat(
        within(screen.getByText('Total').closest('.stat') as HTMLElement)
          .getByText(/\d+\.\d+/).textContent ?? '',
      );
    const fairwayTotal = totalNum();
    fireEvent.click(screen.getByRole('button', { name: 'Rough' }));
    const roughTotal = totalNum();
    expect(roughTotal).toBeLessThan(fairwayTotal);
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

  test('Derived ball launch panel is shown in default Delivery mode, hidden after switching to Ball Launch', () => {
    render(<App />);
    expect(screen.getByText(/Derived ball launch/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ball Launch' }));
    expect(screen.queryByText(/Derived ball launch/i)).toBeNull();
    expect(screen.getByText('Ball Launch', { selector: '.panel-title' })).toBeInTheDocument();
  });

  test('selecting 7i preset in delivery mode changes derived launch angle from driver value', () => {
    render(<App />);
    // Delivery is default; derived launch ≈ 10.9° from Driver preset.
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

  test('reducing backspin to 0 (in launch mode) shortens carry', () => {
    render(<App />);
    // Backspin slider only lives in Ball Launch form; switch first.
    fireEvent.click(screen.getByRole('button', { name: 'Ball Launch' }));
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
