import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

import styles from './SolarSystemScene.module.scss';

type SceneErrorBoundaryProps = PropsWithChildren<{
  resetKey: string;
}>;

type SceneErrorBoundaryState = {
  hasError: boolean;
};

export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Solar System scene failed to render', error, info);
  }

  componentDidUpdate(previousProps: SceneErrorBoundaryProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className={styles.sceneError} role='alert'>
          <span>3D / WebGL</span>
          <h1>Не удалось отобразить сцену</h1>
          <p>Попробуйте переключить качество графики или обновить страницу.</p>
        </section>
      );
    }

    return this.props.children;
  }
}
