import {Router} from "express";
import {resolveAlert} from "../services/alertService";

const router = Router();

router.patch('/:id/resolve', async (req, res) => {
    const alert = await resolveAlert(req.params.id);

    if(!alert) {
        return res.status(404).json({
            error: "Alert not found",
        })
    }

    return res.status(200).json({
        alert,

    })
}) 

export default router;