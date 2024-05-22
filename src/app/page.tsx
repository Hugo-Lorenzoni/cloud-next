"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { getSimilarImages } from "./actions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, ScanSearch } from "lucide-react";

const MAX_FILE_SIZE = 10000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const models = [
  "InceptionV3",
  "MobileNet",
  "ResNet50",
  "VGG16",
  "Xception",
] as const;

const distances = [
  "Euclidienne",
  "Cosine",
  "Bhattacharyya",
  "Correlation",
  "Intersection",
] as const;

const formSchema = z.object({
  image: z
    .custom<File>((v) => v instanceof File)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    )
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`),
  model: z.enum(models),
  distance: z.enum(distances),
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "InceptionV3",
      distance: "Euclidienne",
    },
  });

  const {
    data,
    mutate: server_getSimilarImages,
    isPending,
  } = useMutation({ mutationFn: getSimilarImages });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { image, model, distance } = values;
    const formData = new FormData();
    formData.append("image", image);
    formData.append("model", model);
    formData.append("distance", distance);
    server_getSimilarImages(formData);
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...fieldsProps } }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <FormControl>
                  <Input
                    {...fieldsProps}
                    placeholder="Choisir une image"
                    className="file:border-1 mt-2 flex h-fit cursor-pointer items-center file:cursor-pointer  file:rounded-md"
                    accept=".jpg,.jpeg,.png,.webp"
                    type="file"
                    onChange={(event) =>
                      onChange(event.target.files && event.target.files[0])
                    }
                  />
                </FormControl>
                <FormDescription>
                  Image dont on recherche les images les plus semblables.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un modèle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="InceptionV3">InceptionV3</SelectItem>
                    <SelectItem value="MobileNet">MobileNet</SelectItem>
                    <SelectItem value="ResNet50">ResNet50</SelectItem>
                    <SelectItem value="VGG16">VGG16</SelectItem>
                    <SelectItem value="Xception">Xception</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Le modèle sera utiliser pour la recherche.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Méthode de calcul de la distance</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un modèle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Euclidienne">Euclidienne</SelectItem>
                    <SelectItem value="Cosine">Cosinus similarité</SelectItem>
                    <SelectItem value="Bhattacharyya">Bhattacharyya</SelectItem>
                    <SelectItem value="Correlation">Corrélation</SelectItem>
                    <SelectItem value="Intersection">Intersection</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} type="submit">
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin mr-2" />
            ) : (
              <div className="flex gap-2 items-center">
                <ScanSearch />
                Rechercher
              </div>
            )}
          </Button>
        </form>
      </Form>
      {isPending && (
        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
          <LoaderCircle className="size-8 animate-spin" />
          <p>Chargement...</p>
        </div>
      )}
      {data && data?.length > 0 && (
        <div className="flex flex-col items-center space-y-4 mt-4">
          <h2>Images similaires</h2>
          {data.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${image}`}
              className="rounded-lg shadow-lg"
            />
          ))}
        </div>
      )}
    </main>
  );
}
