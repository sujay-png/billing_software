import 'package:billing_software/auth/login.dart';
import 'package:billing_software/screens/estimates/add_estimate.dart';
import 'package:billing_software/screens/estimates/estimate_preview.dart';
import 'package:billing_software/screens/items/add_items.dart';
import 'package:billing_software/screens/estimates/estimate.dart';
import 'package:billing_software/widgets/app_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart'; 

// 1. Define Supabase client globally
final supabase = Supabase.instance.client;

void main() async {
  // 2. Initialize Flutter bindings and Supabase inside main
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://nadxkuimuqqmxymlbdgf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZHhrdWltdXFxbXh5bWxiZGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzMwMDgsImV4cCI6MjA4NzM0OTAwOH0.wlN5FQVSsoAF1_uz2PLU6rwvQ4Q8TddX8GocVHOF9bI',
  );

   runApp(
    const ProviderScope(
      child: MyApp(),
    ),
  );
}

// 3. Move GoRouter outside of the build method to prevent route resets on rebuild
final _router = GoRouter(
  initialLocation: '/login',
  redirect: (context, state) {
  final session = supabase.auth.currentSession;
  final loggedIn = session != null;

  final isLogin = state.uri.path == '/login';

  if (!loggedIn) {
    return isLogin ? null : '/login';
  }

  if (isLogin) {
    return '/estimates';
  }

  return null;
},
  routes: [
     GoRoute(
       path: '/login',
    builder: (context, state) => const LoginPage(),
    ),
    ShellRoute(
      builder: (context, state, child) {
        return AppShell(child: child);
      },
      routes: [

        //-----LOGIN-------
        
        // -------- ESTIMATES --------
        GoRoute(
          path: '/estimates',
          builder: (context, state) => const EstimateDashboard(),
        ),
        GoRoute(
          path: '/estimates/create',
          builder: (context, state) => const CreateEstimate(),
        ),
        GoRoute(
          path: '/estimates/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return EstimatePreview(estimateId: id);
          },
        ),

        // -------- ITEMS --------
        GoRoute(
          path: '/items',
          builder: (context, state) => const ItemsDashboard(),
        ),
        GoRoute(
          path: '/items/add',
          builder: (context, state) => const AddItemScreen(),
        ),
      ],
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      routerConfig: _router, // Use the global router config
    );
  }
}