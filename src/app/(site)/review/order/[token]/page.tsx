import { findOrderByReviewToken } from "@/lib/orderStore";
import ReviewTokenForm from "@/components/review/ReviewTokenForm";

export default async function ReviewByTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await findOrderByReviewToken(token);

  return (
    <div className="pt-[130px] pb-24">
      <div className="container-app max-w-[600px]">
        {!order ? (
          <div className="card p-10 text-center">
            <h1 className="text-[1.6rem] mb-2.5">Link Not Found</h1>
            <p className="text-text-muted m-0">This review link is invalid or has expired. If you&apos;d still like to leave a review, you can do so from our homepage.</p>
          </div>
        ) : (
          <div className="card p-8 sm:p-10">
            <span className="eyebrow">Order {order.orderId}</span>
            <h1 className="text-[1.8rem] mt-3 mb-2">How Was Your Experience?</h1>
            <p className="text-text-muted mb-7">Thank you for choosing Masfira Maison! We hope you loved your order. We&apos;d love to hear about your experience.</p>
            <ReviewTokenForm
              reviewToken={token}
              orderId={order.orderId}
              customerName={order.fullName}
              customerPhone={order.phone}
              productName={order.productName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
