from groq import Groq
from django.conf import settings
from .models import ContestFeedback

client = Groq(
    api_key=settings.GROQ_API_KEY
)


def generate_contest_feedback(data):



    solved = data.get("solved", 0)
    wrong_submissions = data.get(
        "wrong_submissions", 0
    )

    total_attempts = (
        solved + wrong_submissions
    )

    accuracy = 0

    if total_attempts > 0:
        accuracy = round(
            (solved / total_attempts) * 100,
            2
        )

    

    prompt = f"""
    You are an expert competitive programming mentor.

    Analyze this coding contest performance.

    Contest Data:

    Username: {data.get("username")}
    Score: {data.get("score")}
    Solved Problems: {solved}
    Wrong Submissions: {wrong_submissions}
    Warnings: {data.get("warnings")}
    Winner Score: {data.get("winner_score")}
    Accuracy Percentage: {accuracy}%

    Analyze carefully and provide:

    1. Overall Performance
    2. Accuracy Analysis
    3. Strengths
    4. Weaknesses
    5. Focus and Integrity Analysis
    6. Comparison With Winner
    7. Improvement Suggestions
    8. Final Motivation

    Rules:
    - Keep feedback concise
    - Keep feedback professional
    - Mention accuracy quality
    - Mention warning behavior
    - Mention contest competitiveness
    - Avoid generic motivational fluff
    """

    try:

        response = (
            client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a professional "
                            "competitive programming coach "
                            "who gives analytical and "
                            "performance-focused feedback."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.5,
                max_tokens=600,
            )
        )

        feedback = (
            response.choices[0]
            .message
            .content
        )

        return feedback

    except Exception as e:

        print("AI ERROR:", str(e))

        return (
            "AI feedback generation failed. "
            "Please try again later."
        )
    


def save_contest_feedback(
    user,
    room,
    feedback
):

    ContestFeedback.objects.create(
        user=user,
        room=room,
        feedback=feedback
    )