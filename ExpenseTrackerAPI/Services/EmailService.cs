using PostmarkDotNet;

namespace ExpenseTrackerAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _postmarkApiKey;
        private readonly string _fromEmail;

        public EmailService(IConfiguration configuration)
        {
            _postmarkApiKey = configuration["Postmark:ApiKey"];
            _fromEmail = configuration["Postmark:FromEmail"];
        }

        public async Task<bool> SendOtpEmailAsync(string email, string otp)
        {
            try
            {
                var client = new PostmarkClient(_postmarkApiKey);

                var message = new PostmarkMessage
                {
                    To = email,
                    From = _fromEmail,
                    TrackOpens = true,
                    Subject = "Password Reset OTP",
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;'>
                            <div style='background: linear-gradient(to right, #6366f1, #a855f7); padding: 20px; border-radius: 10px; text-align: center; color: white;'>
                                <h1 style='margin: 0;'>Password Reset</h1>
                            </div>
                            <div style='background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; border: 1px solid #e9ecef;'>
                                <p>Hello,</p>
                                <p>You've requested to reset your password. Please use the following OTP to complete the process:</p>
                                <div style='background-color: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;'>
                                    {otp}
                                </div>
                                <p>This OTP will expire in 10 minutes.</p>
                                <p>If you did not request a password reset, please ignore this email or contact support.</p>
                                <p>Thank you,<br>Expense Tracker Team</p>
                            </div>
                        </div>
                    ",
                    TextBody = $"Your OTP for password reset is: {otp}. This OTP will expire in 10 minutes.",
                    MessageStream = "outbound"
                };

                var response = await client.SendMessageAsync(message);
                return response.Status == PostmarkStatus.Success;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}