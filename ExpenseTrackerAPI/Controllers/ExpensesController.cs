using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ExpenseTrackerAPI.Data;
using Microsoft.EntityFrameworkCore;
using ExpenseTrackerAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ExpenseTrackerAPI.Services;


namespace ExpenseTrackerAPI.Controllers
{
    // [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExpensesController : ControllerBase
    {
        private readonly ExpenseTrackerContext _context;
        private readonly IEmailService _emailService;
        public ExpensesController(ExpenseTrackerContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            // var expenses = await _context.Expenses.ToListAsync();
            // return Ok(expenses);
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            int userId = int.Parse(userIdClaim.Value);

            // Query the expenses for this user
            var expenses = await _context.Expenses
                                         .Where(e => e.UserId == userId)
                                         .ToListAsync();

            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }
            return Ok(expense);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Expense expense)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return CreatedAtAction("Get", new { id = expense.Id }, expense);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Expense expense)
        {
            if (id != expense.Id)
            {
                return BadRequest();
            }
            _context.Entry(expense).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null)
            {
                return NotFound();
            }
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("split")]
        public async Task<IActionResult> SplitExpense([FromBody] ExpenseSplitRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            // if (userIdClaim == null)
            // {
            //     return Unauthorized();
            // }

            bool allEmailSent = true;
            foreach (var splitUser in request.SplitWith)
            {
                string formattedDate = request.Date.ToString("MMMM dd, yyyy");
                bool emailSent = await _emailService.SendSplitMail(
                    email: splitUser.Email,
                    amount: splitUser.Amount.ToString("0.00"),
                    name: splitUser.Name,
                    date: formattedDate,
                    description: request.Description,
                    createdBy: request.CreatedBy
                );
                if (!emailSent)
                {
                    allEmailSent = false;
                }
            }

            return Ok(new
            {
                Success = true,
                Message = allEmailSent ? "All split notifications sent successfully" : "Some split notifications failed to send"
            });
        }

    }


    public class ExpenseSplitRequest
    {
        public string CreatedBy { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public List<SplitUser> SplitWith { get; set; }
    }

    public class SplitUser
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public decimal Amount { get; set; }
    }

}

/*
{
  "createdBy": "Satvik",
  "date": "2025-04-15T06:42:38.009Z",
  "description": "lunch",
  "splitWith": [
    {
      "name": "satvik",
      "email": "satwikagrawal@gmail.com",
      "amount": 10
    },
{
"name":"shankho",
"email":"shankhosuvro@outlook.com",
"amount":190
}
  ]
}
*/