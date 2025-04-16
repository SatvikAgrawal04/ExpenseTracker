namespace ExpenseTrackerAPI.Services
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string email, string otp);
        Task<bool> SendSplitMail(string email, string amount, string name, string date, string description, string createdBy);
    }
}