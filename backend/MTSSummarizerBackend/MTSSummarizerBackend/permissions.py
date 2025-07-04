from rest_framework.permissions import BasePermission


class IsAuthenticatedAndIsAuthor(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated == True
    
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
