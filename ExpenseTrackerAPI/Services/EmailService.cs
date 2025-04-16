using PostmarkDotNet;

namespace ExpenseTrackerAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly string _postmarkApiKey;
        private readonly string _fromEmail;


        public EmailService(IConfiguration configuration)
        {
            _postmarkApiKey = Environment.GetEnvironmentVariable("POSTMARK_TOKEN");
            // _postmarkApiKey = configuration["Postmark:ApiKey"];
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
        public async Task<bool> SendSplitMail(string email, string amount, string name, string date, string description, string createdBy)
        {
            try
            {
                var client = new PostmarkClient(_postmarkApiKey);

                var message = new PostmarkMessage
                {
                    To = email,
                    From = _fromEmail,
                    TrackOpens = true,
                    Subject = "New Expense Split Notification",
                    HtmlBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;'>
                    <div style='background: linear-gradient(to right, #6366f1, #a855f7); padding: 20px; border-radius: 10px; text-align: center; color: white;'>
                        <h1 style='margin: 0;'>Expense Split Notification</h1>
                    </div>
                    <div style='background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; border: 1px solid #e9ecef;'>
                        <p>Hello {name},</p>
                        <p>{createdBy} has split an expense with you:</p>
                        
                        <div style='background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;'>
                            <p><strong>Amount:</strong> ₹{amount}</p>
                            <p><strong>Date:</strong> {date}</p>
                            <p><strong>Description:</strong> {description}</p>
                        </div>
                        
                        <p>Please log in to the Expense Tracker app to view more details or make a payment.</p>
                        <p>Thank you,<br>Expense Tracker Team</p>
                    </div>
                </div>
            ",
                    TextBody = $"Hello {name}, {createdBy} has split an expense with you. Amount: ${amount}, Date: {date}, Description: {description}. Please log in to the Expense Tracker app to view more details.",
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