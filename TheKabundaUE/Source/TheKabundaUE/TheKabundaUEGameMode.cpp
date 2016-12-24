// Copyright 1998-2016 Epic Games, Inc. All Rights Reserved.

#include "TheKabundaUE.h"
#include "TheKabundaUEGameMode.h"
#include "TheKabundaUEPlayerController.h"
#include "TheKabundaUECharacter.h"

ATheKabundaUEGameMode::ATheKabundaUEGameMode()
{
	// use our custom PlayerController class
	PlayerControllerClass = ATheKabundaUEPlayerController::StaticClass();

	// set default pawn class to our Blueprinted character
	static ConstructorHelpers::FClassFinder<APawn> PlayerPawnBPClass(TEXT("/Game/TopDownCPP/Blueprints/TopDownCharacter"));
	if (PlayerPawnBPClass.Class != NULL)
	{
		DefaultPawnClass = PlayerPawnBPClass.Class;
	}
}