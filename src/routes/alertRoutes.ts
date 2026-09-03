import { Router } from "express";
import { acknowledgeAlert } from "../services/alertService";

const router = Router();

router.patch("/:id/acknowledge", async (req, res) => {
  const alert = await acknowledgeAlert(req.params.id);

  if (!alert) {
    return res.status(404).json({
      error: "Alert not found",
    });
  }

  return res.status(200).json({
    alert,
  });
});

export default router;