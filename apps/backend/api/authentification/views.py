from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from .models import CustomUser
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"message": "Login successful"})
        else:
            return JsonResponse({"message": "Invalid credentials"}, status=400)
    return JsonResponse({"message": "Method Not Allowed"}, status=405)


@csrf_exempt
def register_view(request):
    if request.method == "POST":
        print(request.POST)
        email = request.POST.get("email")
        password = request.POST.get("password")

        if email and password:
            user = CustomUser.objects.create_user(email=email, password=password)
            login(request, user)
            return JsonResponse({"message": "User registered successfully"})
        else:
            return JsonResponse({"message": "Email and password required"}, status=400)
    return JsonResponse({"message": "Method Not Allowed"}, status=405)


@login_required
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})


@login_required
def user_session_view(request):
    if request.user.is_authenticated:
        return JsonResponse(
            {
                "username": request.user.email,
                "id": request.user.id,
            }
        )
    else:
        return JsonResponse({"message": "User not authenticated"}, status=401)
