import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';
import type { SkillDependencyMeta } from '../types/manifest';

interface DependencyGraphProps {
  skillName: string;
  dependencies: SkillDependencyMeta;
  onGraphError?: (error: unknown) => void;
}

const toNodeId = (prefix: string, value: string) => `${prefix}-${value.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}`;

const buildGraph = (skillName: string, deps: SkillDependencyMeta): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [
    {
      id: 'skill-center',
      position: { x: 260, y: 180 },
      data: { label: skillName },
      style: {
        border: '1px solid rgba(59, 130, 246, 0.6)',
        borderRadius: 12,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        color: '#dbeafe',
        padding: 8,
        fontWeight: 700,
      },
    },
  ];
  const edges: Edge[] = [];

  const addGroup = (items: string[], prefix: string, x: number, yStart: number, color: string) => {
    items.forEach((item, index) => {
      const id = toNodeId(prefix, item);
      nodes.push({
        id,
        position: { x, y: yStart + index * 64 },
        data: { label: item },
        style: {
          border: `1px solid ${color}`,
          borderRadius: 10,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          color: '#cbd5e1',
          padding: 6,
          maxWidth: 260,
        },
      });
      edges.push({
        id: `edge-${id}`,
        source: 'skill-center',
        target: id,
        style: { stroke: color, strokeWidth: 1.2 },
        animated: false,
      });
    });
  };

  addGroup(deps.skills, 'skill', 20, 40, 'rgba(59, 130, 246, 0.8)');
  addGroup(deps.libraries, 'lib', 480, 40, 'rgba(16, 185, 129, 0.8)');
  addGroup(deps.runtimeTools, 'runtime', 240, 340, 'rgba(245, 158, 11, 0.8)');

  return { nodes, edges };
};

export const DependencyGraph = ({ skillName, dependencies, onGraphError }: DependencyGraphProps) => {
  const hasData =
    dependencies.skills.length > 0 ||
    dependencies.libraries.length > 0 ||
    dependencies.runtimeTools.length > 0;

  if (!hasData) {
    return (
      <p className="text-sm text-slate-500">
        No structured dependencies found.
      </p>
    );
  }

  try {
    const { nodes, edges } = buildGraph(skillName, dependencies);
    return (
      <div className="h-96 w-full rounded-xl border border-slate-800 overflow-hidden bg-slate-950/80">
        <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.2} maxZoom={1.5} fitViewOptions={{ padding: 0.2 }}>
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
          <Background gap={20} size={1} color="#1f2937" />
        </ReactFlow>
      </div>
    );
  } catch (error) {
    onGraphError?.(error);
    return null;
  }
};

export default DependencyGraph;
