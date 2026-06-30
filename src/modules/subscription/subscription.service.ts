import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createSubscriptionSession = async (userId: string) => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    id: userId
                },
                include: {
                    subscriptions: true
                }
            });

            // Old subscribers
            let stripeCustomerId = user.subscriptions?.stripeCustomerId;

            if (!stripeCustomerId) {
                // New subscribers
                const customer = await stripe.customers.create({
                    email: user.email,
                    name: user.name,
                    metadata: {         // * Extra information put in 'Metadata'
                        userId: user.id
                    }
                });

                stripeCustomerId = customer.id;
            }

            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price: config.stripe.productId,
                        quantity: 1
                    }
                ],
                mode: "subscription",
                customer: stripeCustomerId,
                payment_method_types: ["card"],
                success_url: `${config.appUrl}/premium?success=true`,
                cancel_url: `${config.appUrl}/payment?success=false`,
                metadata: {
                    userId: user.id
                }
            });

            return session.url;
        }
    );

    return {
        paymentUrl: transactionResult
    };
};


export const subscriptionService = {
    createSubscriptionSession,
}