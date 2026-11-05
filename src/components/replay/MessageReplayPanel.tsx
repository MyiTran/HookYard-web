import type { MessageReplay } from "../../types/replay";
import SingleReplayControl from "./SingleReplayControl";

type MessageReplayPanelProps = {
  messageId: string;
  replay: MessageReplay;
  onReplayed: () => void;
};

function MessageReplayPanel({ messageId, replay, onReplayed }: MessageReplayPanelProps) {
  return (
    <section className="mt-5 rounded-[18px] border border-[#D8E3DB] bg-white p-5 shadow-[0_8px_30px_rgba(32,78,53,0.05)]">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Replay</h2>
        <p className="mt-1 text-xs font-medium text-[#8A9990]">
          A replay sends this delivery again as a new attempt. Original attempts stay in the history.
        </p>
      </div>

      <SingleReplayControl messageId={messageId} replay={replay} onReplayed={onReplayed} />
    </section>
  );
}

export default MessageReplayPanel;
