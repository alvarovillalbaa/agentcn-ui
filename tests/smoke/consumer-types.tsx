import * as React from 'react';
import { AgentRun, ToolCall, ApprovalRequest, PlanReview, Checkpoint, ContextWindow, MemoryPanel, SourceStack, AgentHandoff, ModelRouter, PromptComposer, BranchPicker, ArtifactPanel, StreamStatus, TokenUsage, EvalScorecard, MultiInput, MemberPicker, CreatableSelect, PricingTable } from '@alvarovillalbaa/agentcn-ui';
import { AgentRun as S01 } from '@alvarovillalbaa/agentcn-ui/agent-run';
import { ToolCall as S02 } from '@alvarovillalbaa/agentcn-ui/tool-call';
import { ApprovalRequest as S03 } from '@alvarovillalbaa/agentcn-ui/approval-request';
import { PlanReview as S04 } from '@alvarovillalbaa/agentcn-ui/plan-review';
import { Checkpoint as S05 } from '@alvarovillalbaa/agentcn-ui/checkpoint';
import { ContextWindow as S06 } from '@alvarovillalbaa/agentcn-ui/context-window';
import { MemoryPanel as S07 } from '@alvarovillalbaa/agentcn-ui/memory-panel';
import { SourceStack as S08 } from '@alvarovillalbaa/agentcn-ui/source-stack';
import { AgentHandoff as S09 } from '@alvarovillalbaa/agentcn-ui/agent-handoff';
import { ModelRouter as S10 } from '@alvarovillalbaa/agentcn-ui/model-router';
import { PromptComposer as S11 } from '@alvarovillalbaa/agentcn-ui/prompt-composer';
import { BranchPicker as S12 } from '@alvarovillalbaa/agentcn-ui/branch-picker';
import { ArtifactPanel as S13 } from '@alvarovillalbaa/agentcn-ui/artifact-panel';
import { StreamStatus as S14 } from '@alvarovillalbaa/agentcn-ui/stream-status';
import { TokenUsage as S15 } from '@alvarovillalbaa/agentcn-ui/token-usage';
import { EvalScorecard as S16 } from '@alvarovillalbaa/agentcn-ui/eval-scorecard';
import { MultiInput as S17 } from '@alvarovillalbaa/agentcn-ui/multi-input';
import { MemberPicker as S18 } from '@alvarovillalbaa/agentcn-ui/member-picker';
import { CreatableSelect as S19 } from '@alvarovillalbaa/agentcn-ui/creatable-select';
import { PricingTable as S20 } from '@alvarovillalbaa/agentcn-ui/pricing-table';

export const roots = [AgentRun, ToolCall, ApprovalRequest, PlanReview, Checkpoint, ContextWindow, MemoryPanel, SourceStack, AgentHandoff, ModelRouter, PromptComposer, BranchPicker, ArtifactPanel, StreamStatus, TokenUsage, EvalScorecard, MultiInput, MemberPicker, CreatableSelect, PricingTable];
export const subpaths = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, S20];
export const fixtures = <>
  <MultiInput values={['Authored tag']} onValuesChange={(values: string[]) => { void values; }} maxItems={2} />
  <MemberPicker members={[{ id: 'm', name: 'Mira' }]} value={['m']} onValueChange={(ids: string[]) => { void ids; }} />
  <CreatableSelect options={[{ id: 'one', label: 'Existing' }]} value="one" onValueChange={(id: string) => { void id; }} onCreate={async (label: string) => { void label; }} />
  <PricingTable plans={[{ id: 'pro', name: 'Pro', price: '$9', features: ['Authored'] }]} onChoose={async (id: string) => { void id; }} />
</>;
