import json, os, random

DATA_FILE = os.path.join(os.path.dirname(__file__), "../data/users.json")

def load_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def get_points(user_id):
    data = load_data()
    return data.get(user_id, {}).get("points", 0)

def add_points(user_id, amount):
    data = load_data()
    user = data.get(user_id, {"points": 0, "invited_by": None})
    user["points"] += amount
    data[user_id] = user
    save_data(data)

def deduct_points(user_id, cost):
    data = load_data()
    user = data.get(user_id, {"points": 0})
    if user["points"] < cost:
        return False
    user["points"] -= cost
    data[user_id] = user
    save_data(data)
    return True

def handle_referral(inviter_id, invitee_id):
    """裂变逻辑：分享双方都得奖励"""
    reward_inviter = random.randint(5, 10)
    reward_invitee = random.randint(3, 8)
    add_points(inviter_id, reward_inviter)
    add_points(invitee_id, reward_invitee)
    return {"inviter_reward": reward_inviter, "invitee_reward": reward_invitee}
