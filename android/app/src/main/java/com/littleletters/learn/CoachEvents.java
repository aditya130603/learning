package com.littleletters.learn;
public interface CoachEvents {
    void status(String message);
    void reply(int requestId, String text, String error);
}
