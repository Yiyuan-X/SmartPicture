from flask import Blueprint, request, jsonify
from utils.points import handle_referral

referral_bp = Blueprint("referral", __name__)

@referral_bp.route("/api/referral", methods=["POST"])
def referral():
    """邀请接口，双方都随机获得积分"""
    data = request.get_json(force=True)
    inviter = data.get("inviter_id")
    invitee = data.get("invitee_id")

    if not inviter or not invitee:
        return jsonify({"error": "缺少邀请人或被邀请人 ID"}), 400

    result = handle_referral(inviter, invitee)
    return jsonify({
        "message": "🎉 邀请成功！双方已获得奖励",
        "details": result
    }), 200
