'use client'

import { executeGraph } from '@/actions/graph';
import Dataflow from '@/dataflow/components/core/Dataflow';

export default function Page() {
  return (
      <Dataflow remoteExecutor={executeGraph}/>
  );
}
