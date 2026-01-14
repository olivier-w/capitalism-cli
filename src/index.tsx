#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { App } from './ui/App.tsx';

const { waitUntilExit } = render(
  <App onExit={() => process.exit(0)} />
);

await waitUntilExit();
