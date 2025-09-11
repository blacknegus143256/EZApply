<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800">
            Register Company
        </h2>
    </x-slot>

    <div class="max-w-2xl mx-auto mt-6">
        <form method="POST" action="{{ route('company.store') }}">
            @csrf

            <div class="mb-4">
                <x-input-label for="name" :value="'Company Name'" />
                <x-text-input id="name" class="block mt-1 w-full" type="text" name="name" required autofocus />
                <x-input-error :messages="$errors->get('name')" class="mt-2" />
            </div>

            <div class="mb-4">
                <x-input-label for="description" :value="'Description'" />
                <x-text-input id="description" class="block mt-1 w-full" type="text" name="description" required />
                <x-input-error :messages="$errors->get('description')" class="mt-2" />
            </div>

            <div class="mb-4">
                <x-input-label for="email" :value="'Email'" />
                <x-text-input id="email" class="block mt-1 w-full" type="email" name="email" required />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>

            <div class="mb-4">
                <x-input-label for="address" :value="'Address'" />
                <x-text-input id="address" class="block mt-1 w-full" type="text" name="address" />
            </div>

            <div class="mb-4">
                <x-input-label for="contact_number" :value="'Contact Number'" />
                <x-text-input id="contact_number" class="block mt-1 w-full" type="text" name="contact_number" />
            </div>

            <x-primary-button>
                Register
            </x-primary-button>
        </form>
    </div>
</x-app-layout>
