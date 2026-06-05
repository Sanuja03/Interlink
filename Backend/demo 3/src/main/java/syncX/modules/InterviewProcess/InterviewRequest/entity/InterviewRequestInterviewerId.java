package syncX.modules.InterviewProcess.InterviewRequest.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class InterviewRequestInterviewerId implements Serializable {

    private UUID interviewRequest;
    private UUID interviewerUserId;

    public InterviewRequestInterviewerId() {}

    public InterviewRequestInterviewerId(UUID interviewRequest, UUID interviewerUserId) {
        this.interviewRequest = interviewRequest;
        this.interviewerUserId = interviewerUserId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof InterviewRequestInterviewerId)) return false;
        InterviewRequestInterviewerId that = (InterviewRequestInterviewerId) o;
        return Objects.equals(interviewRequest, that.interviewRequest) &&
                Objects.equals(interviewerUserId, that.interviewerUserId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(interviewRequest, interviewerUserId);
    }
}