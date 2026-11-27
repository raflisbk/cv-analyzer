import PenArrow from "@/components/landing/pen/pen-arrow";
import PenCircle from "@/components/landing/pen/pen-circle";
import PenHighlight from "@/components/landing/pen/pen-highlight";
import PenStrike from "@/components/landing/pen/pen-strike";
import PenUnderline from "@/components/landing/pen/pen-underline";
import type { PenMarkKind } from "@/lib/landing-laptop-insights";

const marks = {
  circle: PenCircle,
  underline: PenUnderline,
  arrow: PenArrow,
  strike: PenStrike,
  highlight: PenHighlight,
};

export default function SceneMark({ kind }: { kind: PenMarkKind }) {
  const Mark = marks[kind];
  return <Mark play={false} />;
}
