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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { getSimilarImages } from "./actions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoaderCircle, ScanSearch } from "lucide-react";
import { ComponentType, useState } from "react";
import { CustomTooltipProps, LineChart } from "@tremor/react";
import { cn } from "@/lib/utils";

// const MAX_FILE_SIZE = 10000000;
// const ACCEPTED_IMAGE_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp",
// ];

const regex = /^(?:[0-9]|[1-9][0-9]|[1-9][0-9]{2})\.jpg$/;

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
  // image: z
  //   .custom<File>((v) => v instanceof File)
  //   .refine(
  //     (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
  //     ".jpg, .jpeg, .png and .webp files are accepted."
  //   )
  //   .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`),
  image: z
    .string()
    .refine(
      (name) => regex.test(name),
      "Seulement les images de cette sélections sont acceptées."
    ),
  model: z.enum(models),
  distance: z.enum(distances),
  k: z.enum(["20", "50"]),
});

function removeUpToChar(str: string, char: string) {
  const index = str.indexOf(char);
  if (index === -1) {
    // If the character is not found, return the original string
    return str;
  }
  // Return the substring starting from the character after the found one
  return str.substring(index + 1);
}

const customTooltip: ComponentType<CustomTooltipProps> = (props) => {
  const { payload, active } = props;
  if (!active || !payload) return null;
  return (
    <div className="w-56 rounded-tremor-default border border-tremor-border bg-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
      {payload.map((category, idx) => (
        <div key={idx} className="flex flex-1 space-x-2.5">
          <div
            className={`flex w-1 flex-col bg-${category.color}-500 rounded`}
          />
          <div className="space-y-1">
            <p className="text-tremor-content">{category.dataKey}</p>
            <p className="font-medium text-tremor-content-emphasis">
              {category.value
                ? parseFloat(category.value.toString()).toFixed(2)
                : "0"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      model: "InceptionV3",
      distance: "Euclidienne",
      k: "20",
    },
  });

  const {
    data,
    mutate: server_getSimilarImages,
    isPending,
  } = useMutation({ mutationFn: getSimilarImages });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { image, model, distance, k } = values;
    console.log(image);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("model", model);
    formData.append("distance", distance);
    formData.append("k", k);
    server_getSimilarImages(formData);
  }
  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 px-4 sm:px-8 lg:px-24 gap-12 min-h-screen mt-8">
      <section className="lg:sticky h-fit top-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=" grid sm:grid-cols-2 gap-8"
          >
            <FormField
              control={form.control}
              name="image"
              render={({ field: { value, onChange, ...fieldsProps } }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>

                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt="image de recherche"
                      className="rounded-xl shadow-lg"
                    />
                  ) : (
                    <img
                      src="placeholder-image.jpg"
                      alt="image placeholder"
                      className="rounded-xl shadow-lg"
                    />
                  )}

                  <FormControl>
                    {/* <Input
                      {...fieldsProps}
                      placeholder="Choisir une image"
                      className="file:border-1 mt-2 flex h-fit cursor-pointer items-center file:cursor-pointer  file:rounded-md"
                      accept=".jpg,.jpeg,.png,.webp"
                      type="file"
                      onChange={(event) => {
                        onChange(event.target.files && event.target.files[0]),
                          event.target.files && event.target.files[0]
                            ? setCurrentImage(
                                URL.createObjectURL(event.target.files[0])
                              )
                            : setCurrentImage(null);
                      }}
                    /> */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Choisir une image</Button>
                      </DialogTrigger>
                      <DialogContent className="h-3/4 max-w-[75%] rounded-lg">
                        <DialogHeader>
                          <DialogTitle>Choisir une image</DialogTitle>
                          <DialogDescription>
                            Image dont on recherche les images les plus
                            semblables.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-scroll p-2">
                          {Array.from({ length: 1000 }, (_, i) => {
                            // get the size of the image
                            return (
                              <img
                                {...fieldsProps}
                                key={i}
                                src={`/images/${i}.jpg`}
                                alt={`Image ${i}`}
                                className={cn(
                                  "rounded-xl shadow-lg self-center cursor-pointer",
                                  currentImage === `/images/${i}.jpg`
                                    ? "outline outline-4 outline-blue-500"
                                    : ""
                                )}
                                onClick={() => {
                                  setCurrentImage(`/images/${i}.jpg`);
                                  onChange(`${i}.jpg`);
                                }}
                              />
                            );
                          })}
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant={currentImage ? "default" : "secondary"}
                            >
                              Comfirmer
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </FormControl>
                  <FormDescription>
                    Image dont on recherche les images les plus semblables.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-6">
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
                        <SelectItem value="Cosine">
                          Cosinus similarité
                        </SelectItem>
                        <SelectItem value="Bhattacharyya">
                          Bhattacharyya
                        </SelectItem>
                        <SelectItem value="Correlation">Corrélation</SelectItem>
                        <SelectItem value="Intersection">
                          Intersection
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="k"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d&apos;élément proche</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un nombre d'élément" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="20">Top 20</SelectItem>
                        <SelectItem value="50">Top 50</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} type="submit">
                {isPending ? (
                  <div className="flex gap-2 items-center">
                    <LoaderCircle className="size-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <ScanSearch />
                    Rechercher
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>

        {data && data.rappelPrecision && (
          <>
            <h3 className="mt-8 font-semibold text-lg text-center">
              Courbe rappel-précision
            </h3>
            <LineChart
              className=" text-sm"
              data={data.rappelPrecision}
              index="Rappel"
              categories={["Precision"]}
              colors={["blue"]}
              customTooltip={customTooltip}
              autoMinValue
              xAxisLabel="Rappel"
              yAxisLabel="Precision"
              showAnimation
            />
          </>
        )}
      </section>
      {isPending && (
        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
          <LoaderCircle className="size-8 animate-spin" />
          <p>Chargement...</p>
        </div>
      )}
      {data && data.voisins && data?.voisins.length > 0 && (
        <div className="flex flex-col space-y-4 my-4 lg:mt-0">
          <h2 className="font-semibold text-lg">Images similaires</h2>
          <div className="grid grid-flow-row-dense grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 2xl:grid-cols-3 gap-2">
            {data.voisins.map((image, index) => (
              <div className="flex items-center justify-center" key={index}>
                <img
                  src={removeUpToChar(image[0], "/")}
                  alt={`${image[0]}`}
                  className="rounded-xl shadow-lg w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
