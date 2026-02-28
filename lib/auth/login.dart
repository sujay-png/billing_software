import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final supabase = Supabase.instance.client;
  final emailcontroller = TextEditingController();
  final passwordcontroller = TextEditingController();
  bool isLogin = true;
  bool isLoading = false;
bool _isPasswordVisible = false;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F7),

      body: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Sign in to Continue",
                style: TextStyle(
                  fontSize: 18,
                  color: Colors.black87,
                  fontWeight: FontWeight.w600,
                ),
              ),

              const SizedBox(height: 40),

              Container(
                width: 400,
                alignment: Alignment.centerLeft,
                child: const Text(
                  "Email",
                  style: TextStyle(color: Colors.black87, fontSize: 14),
                ),
              ),
              const SizedBox(height: 6),

              Container(
                width: 400,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: TextField(
                  controller: emailcontroller,
                  decoration: const InputDecoration(
                    hintText: "Enter Your Email",
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

             Container(
  width: 400,
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: Colors.grey.shade300),
  ),
  child: TextField(
    controller: passwordcontroller,
    // This is the key property for hiding text
    obscureText: !_isPasswordVisible, 
    decoration: InputDecoration(
      hintText: "Enter Your Password",
      hintStyle: const TextStyle(color: Colors.grey),
      border: InputBorder.none,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 14,
      ),
      // Adding a toggle icon on the right side
      suffixIcon: IconButton(
        icon: Icon(
          _isPasswordVisible ? Icons.visibility : Icons.visibility_off,
          color: Colors.grey,
        ),
        onPressed: () {
          setState(() {
            _isPasswordVisible = !_isPasswordVisible;
          });
        },
      ),
    ),
  ),
),
              const SizedBox(height: 6),

              Container(
                width: 400,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: TextField(
                  controller: passwordcontroller,
                  obscureText: true,
                  decoration: InputDecoration(
                    hintText: "Enter Your Password",
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),
              const SizedBox(width: 12),

              // Row(

              //   children: [

              //      Align(
              //        alignment: Alignment.centerRight,
              //        child: Text(
              //          "Forgot Password?",
              //          style: TextStyle(
              //            color: Color(0xFF7B2FFF),
              //            fontSize: 13,
              //            fontWeight: FontWeight.w600,
              //          ),
              //        ),
              //      ),

              //   ],
              // ),
              const SizedBox(height: 24),

              SizedBox(
                width: 400,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF7B2FFF),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 2,
                  ),
                  onPressed: () async {
                    final email = emailcontroller.text.trim();
                    final password = passwordcontroller.text.trim();
                    final messenger = ScaffoldMessenger.of(context);

                    if (email.isEmpty || password.isEmpty) {
                      messenger.showSnackBar(
                        const SnackBar(
                          content: Text('Email and password are required'),
                        ),
                      );
                      return;
                    }

                    setState(() => isLoading = true);

                    try {
                      final response = await supabase.auth.signInWithPassword(
                        email: email,
                        password: password,
                      );

                      // ✅ Auth success → router redirect will handle navigation
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Login successful')),
                      );
                    } on AuthException catch (e) {
                      messenger.showSnackBar(
                        SnackBar(content: Text(e.message)),
                      );
                    } catch (_) {
                      messenger.showSnackBar(
                        const SnackBar(content: Text('Something went wrong')),
                      );
                    }
                  },
                  child: const Text(
                    "Sign In",
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),

              const SizedBox(height: 80),

              const Text(
                "CRM System Designed & Developed by Red Media Solutions",
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
