import ActivityIcon from "../icons/ActivityIcon";
import Pagination from "../ui/Pagination";

function DeliveryActivityPanel() {
  return (
    <section className="mt-6">
      <h2 className="text-sm font-semibold tracking-tight text-[#1F2A24]">Delivery activity</h2>
      <p className="mt-1 text-xs font-medium text-[#8A9990]">
        Webhook delivery history for this endpoint will appear here.
      </p>

      <div className="mt-4 rounded-[14px] border border-dashed border-[#D2DAD5] bg-[#F2F4F3] px-6 py-12 text-center">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5D7063]">
          <ActivityIcon className="h-5 w-5" />
        </span>

        <p className="mt-3 text-sm font-semibold text-[#1F2A24]">No deliveries yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-[#8A9990]">
          Delivery attempts will appear here after this endpoint receives matching events.
        </p>
      </div>

      <div className="mt-4">
        <Pagination page={1} totalPages={1} totalCount={0} pageSize={25} disabled onPageChange={() => {}} />
      </div>
    </section>
  );
}

export default DeliveryActivityPanel;
