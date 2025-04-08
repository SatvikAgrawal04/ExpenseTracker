namespace ExpenseTrackerAPI.Services
{
    public interface IOtpService
    {
        string GenerateOtp();
        Task<bool> StoreOtpAsync(string email, string otp);
        Task<bool> VerifyOtpAsync(string email, string otp);
        Task RemoveOtpAsync(string email);
    }
}