using System.Collections.Concurrent;

namespace ExpenseTrackerAPI.Services
{
    public class OtpService : IOtpService
    {
        private readonly ConcurrentDictionary<string, (string otp, DateTime expiry)> _otpStore = new();
        private readonly TimeSpan _otpValidity = TimeSpan.FromMinutes(10);

        public string GenerateOtp()
        {
            // Generate a 6-digit OTP
            Random random = new Random();
            return random.Next(100000, 999999).ToString();
        }

        public Task<bool> StoreOtpAsync(string email, string otp)
        {
            var expiryTime = DateTime.UtcNow.Add(_otpValidity);
            _otpStore.AddOrUpdate(
                email.ToLower(),
                (otp, expiryTime),
                (_, _) => (otp, expiryTime));
            return Task.FromResult(true);
        }

        public Task<bool> VerifyOtpAsync(string email, string otp)
        {
            if (_otpStore.TryGetValue(email.ToLower(), out var otpInfo))
            {
                if (otpInfo.otp == otp && otpInfo.expiry > DateTime.UtcNow)
                {
                    return Task.FromResult(true);
                }
            }
            return Task.FromResult(false);
        }
        public Task RemoveOtpAsync(string email)
        {
            _otpStore.TryRemove(email.ToLower(), out _);
            return Task.CompletedTask;
        }
    }
}