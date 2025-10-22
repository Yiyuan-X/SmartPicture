import { onRequest } from "firebase-functions/v2/https"

import Stripe from "stripe";
import admin from "firebase-admin";
import { requireAuth } from "../utils/requireAuth.js";

const db = admin.firestore();
const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-09-30.clover" });

export const createCheckout = onRequest(async (req, res) => {
  try {
    const uid = await requireAuth(req);
    const { packageId } = req.body;
    const pkg = (await db.collection("packages").doc(packageId).get()).data();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: { name: pkg.name },
            unit_amount: pkg.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://smartpicture.ai/success",
      cancel_url: "https://smartpicture.ai/cancel",
      metadata: { uid, points: pkg.points },
    });
    res.json({ url: session.url });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
