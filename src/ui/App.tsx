import { BallLaunchForm } from './panels/BallLaunchForm';
import { EnvPanel } from './panels/EnvPanel';
import { ReadoutPanel } from './panels/ReadoutPanel';
import { SideProfilePlot } from './plots/SideProfilePlot';
import { TopDownPlot } from './plots/TopDownPlot';
import { Scene } from './scene/Scene';
import { UnitsToggle } from './controls/UnitsToggle';

export function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Golfshot Sim</h1>
        <div className="app-header-controls">
          <UnitsToggle />
        </div>
      </header>

      <main className="app-main">
        <aside className="app-side">
          <BallLaunchForm />
          <EnvPanel />
        </aside>

        <section className="app-content">
          <ReadoutPanel />
          <Scene />
          <div className="plot-row">
            <SideProfilePlot />
            <TopDownPlot />
          </div>
        </section>
      </main>
    </div>
  );
}
